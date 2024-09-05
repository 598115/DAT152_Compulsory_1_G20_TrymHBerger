const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/tasklist.css"/>

    <div id="tasklist"></div>`;          

const tasktable = document.createElement("template");
tasktable.innerHTML = `
    <table>
        <thead><tr><th>Task</th><th>Status</th></tr></thead>
        <tbody></tbody>
    </table>`;

const taskrow = document.createElement("template");
taskrow.innerHTML = `
    <tr>
        <td></td>
        <td></td>
        <td>
            <select>
                <option value="0" selected>&lt;Modify&gt;</option>
            </select>
        </td>
        <td><button type="button">Remove</button></td>
    </tr>`;

/**
  * TaskList
  * Manage view with list of tasks
  */
class TaskList extends HTMLElement {
    #shadow
    constructor() {                                                              
        super();
        
        this.#shadow = this.attachShadow({mode:"closed"});
        this.template = template.content.cloneNode(true);
        this.tasktable = tasktable.content.cloneNode(true);
        this.taskrow = taskrow.content.cloneNode(true);
        this.#shadow.append(this.template);
    }

    /**
     * @public
     * @param {Array} list with all possible task statuses
     */
    setStatuseslist(allstatuses) {

    const select = this.taskrow.querySelector("select");
    //Iterate over statuses array
    for(let s of allstatuses) {
      //Create new option element
      const newOption = document.createElement("option");
      //Aplly data to element
      newOption.textContent = s;
      newOption.value = s;
      //Insert new element into DOM
      select.insertAdjacentElement('beforeend', newOption);
    }

  }

    /**
     * Add callback to run on change on change of status of a task, i.e. on change in the SELECT element
     * @public
     * @param {function} callback
     */
    changestatusCallback(callback) {
    setTimeout(() => {
    const selecters = this.#shadow.querySelectorAll("tr:not(thead tr)");
    selecters.forEach(selector => {
        selector.addEventListener('change', (event) => { 
            const selectElement = event.target;
            const selectedOption = selectElement.options[selectElement.selectedIndex];
            const container = selectElement.closest("tr");          
            const id = container.id;
            const optionName = container.querySelector("td").textContent;
            const optionStatus = selectedOption.textContent;

            const userRespone = confirm(`Set '${optionName}' to ${optionStatus}?`)

            if(userRespone) { //Clicked OK
                callback(id, optionStatus);
            }
            else {
                selectElement.value ="0";
                return
            }             
        })
      });
    }, 1000)                      
    
  }

    /**
     * Add callback to run on click on delete button of a task
     * @public
     * @param {function} callback
     */
    deletetaskCallback(callback) {
       
        setTimeout(() => {
            const rows = this.#shadow.querySelectorAll("tr:not(thead tr)");
            console.log(rows);  
            rows.forEach(row => {
                const button = row.querySelector("button");
                button.addEventListener('click', (event) => { 
                    const buttonElement = event.target;
                    const container = buttonElement.closest("tr");          
                    const id = container.id;
                    const optionName = container.querySelector("td").textContent;
        
                    const userRespone = confirm(`Delete task '${optionName}?`)
        
                    if(userRespone) { //Clicked OK
                        callback(id);
                    }
                    else {
                        return
                    }             
                })
              });
            }, 1000)                      
    }

    /**
     * Add task at top in list of tasks in the view
     * @public
     * @param {Object} task - Object representing a task
     */
    showTask(task) {                                            
       
         //Check if list elemnt present
         let list = this.#shadow.querySelector("table");
         if(list === null) {
            //Add new list element if not present
            this.#shadow.querySelector("div").appendChild(this.tasktable);
            list = this.#shadow.querySelector("table");         
         }
         //create row element
         const newRow = this.taskrow.cloneNode(true);

         //add new task information to row element
         newRow.querySelector("tr").id = `${task.id}`;
         const rowinfo = newRow.querySelectorAll("td");
         rowinfo[0].textContent = task.title;
         rowinfo[1].textContent = task.status;
         list.insertBefore(newRow, list.firstChild)
         this.getNumtasks();  
    }

    /**
     * Update the status of a task in the view
     * @param {Object} task - Object with attributes {'id':taskId,'status':newStatus}
     */
    updateTask(task) {     
        //Get row element with matching id
       const row = this.#shadow.querySelector(`tr[id='${task.id}']`); 
       //Get status cell of row and update it
             const cells = row.querySelectorAll("td");
             cells[1].textContent = task.status;             
    }

    /**
     * Remove a task from the view
     * @param {Integer} task - ID of task to remove
     */
    removeTask(id) {
        //Get row element with matching id
        const row = this.#shadow.querySelector(`tr[id='${id}']`);
       if(row) { //Remove the row if found
        row.remove();
       }
       else {
        return;
       }
       const list = this.#shadow.querySelector("select");
       if(list === null) {
        const table = this.#shadow.querySelector("table");
        table.remove();
        console.log("Removed table");
       }
       this.getNumtasks();
    }

    /**
     * @public
     * @return {Number} - Number of tasks on display in view
     */
    getNumtasks() {   
    const rows = this.#shadow.querySelectorAll("tr:not(thead tr)");
    const number = rows.length;
    return `Found ${number} tasks.`;   
    }
}
customElements.define('task-list', TaskList);
