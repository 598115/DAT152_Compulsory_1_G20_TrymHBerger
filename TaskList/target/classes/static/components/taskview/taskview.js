const template = document.createElement("template");
template.innerHTML = `
    <link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskview.css"/>
         <h1>Tasks</h1>
         <div id="message"><p>Waiting for server data.</p></div>
         <div id="newtask">
               <button type="button" disabled>New task</button>
         </div>
         <!-- The task list -->
        <task-list></task-list>
        <!-- The Modal -->
        <task-box></task-box>
    `;
    
/**
  * TaskView
  * Manage tasklist, taskbox components and Ajax
  */
class TaskView extends HTMLElement {
        #shadow
        #taskBox
        #taskList
        constructor() {                                                              
            super();          
            this.#shadow = this.attachShadow({mode:"closed"});
            this.template = template.content.cloneNode(true);
            this.#shadow.append(this.template);
            this.#taskBox = this.#shadow.querySelector("task-box");
            this.#taskList = this.#shadow.querySelector("task-list");

            //Initialize view and listeners
            this.#shadow.querySelector("button").addEventListener('click', (event) => {
                this.#taskBox.show();
            });
            this.fetchAvailableStatuses();    
            this.postNewTask();
            this.fetchTasks();
            this.updateTaskStatus();
            this.deleteTask();
        }

    /**
     * @public
     * Uses Ajax to retrieve all statuses in database and add them to view with tasklist and taskbox API
     */
    async fetchAvailableStatuses() { 
        
         try {
            const response = await fetch("api/allstatuses");
            const data = await response.json();
            const dataArray = data.allstatuses;
            //If true server response, update view
            if(data.responseStatus) {
               this.#taskBox.setStatuseslist(dataArray);
               this.#taskList.setStatuseslist(dataArray);
            }
            else{
                console.error("responseStatus : false when fetching task statuses");
            }
         }
       catch(e) { //General exceptions/errors
          console.error(`Error when fetching statuses: ${e.message}`);
       }
    }

    /**
     * @public
     * Uses Ajax to retrieve all tasks in database and add them to view with tasklist API
     */
    async fetchTasks() {
        try {
            const response = await fetch("api/tasklist");
            const data = await response.json();
            const taskArray = data.tasks;
               //If no tasks found in database
               if(taskArray.length === 0) {
                const message = this.#shadow.querySelector("#message");
                message.textContent = "No tasks found.";
               }
               else {
                 //if tasks found and response true, show tasks in view
                  if(data.responseStatus) {
                        for (let t of taskArray) {
                             this.#taskList.showTask(t);
                        } 
                    }
                    else{
                        console.error("responseStatus : false when fetching tasks");
                    }           
                this.refreshMessageElement(); //Update count of how many tasks are now in view                
               }
            this.#shadow.querySelector("button").disabled = false; //After tasks finished fetching, enable new tasks button
         }
       catch(e) {//General error catching
          console.error(`Error when fetching tasks: ${e.message}`);
       }
    }

   /**
    * Uses Ajax to post a new task to the database. Uses taskbox API to get new task data
    */
   postNewTask() {

        this.#taskBox.newtaskCallback(
       async (newEvent) => {        
        
                const config = {         //Configuration object for Ajax fetch
                    'method': 'POST',
                    'headers': {'Content-Type': 'application/json; charset=utf-8'},
                    'body': JSON.stringify(newEvent)
                }
                const response = await fetch("api/task", config);
                const data = await response.json();
                 //If true server response, update view with new task
                if(data.responseStatus) {
                    this.#taskList.showTask(data.task);
                    this.refreshMessageElement();
                }
      });
    }

    /**
     * Gets a single task from the database with a given id number
     * @param {number} id 
     * @returns task object
     */
   async getTask(id) { //Not in use
        try {
           const response = await fetch(`api/task/${id}`);
           const data = await response.json();
           return data.task;
        }
            catch(e) {
              console.error(`Error when fetching task: ${e.message}`);
            }
   }

   /**
    * Updates the status of a task on the server.
    * Uses tasklist API to listen for desired change and update view.
    */
   updateTaskStatus() {
         
   this.#taskList.changestatusCallback(
    async (id, status) => {
          
        try {
            const config = {      //Ajax fetch config object
                'method': 'PUT',
                'headers': {'Content-Type': 'application/json; charset=utf-8'},
                'body': JSON.stringify({"status": status})
            }
           const response = await fetch(`api/task/${id}`, config);
           const data = await response.json();
           //if server response ok update the view
           if(data.responseStatus) {
            const task = await this.getTask(id);
            this.#taskList.updateTask(task);
           }
        }
        catch(e) {
            console.error(`Error when updating task status: ${e.message}`);
        }
    });
   }

   /**
    * Uses Ajax to delete a task in database.
    * Uses tasklist API to listen for delete button click and update view
    */
   deleteTask() {

    this.#taskList.deletetaskCallback(
       async (id) => {
        try {
        const response = await fetch(`api/task/${id}`, {"method": 'DELETE'});
        const data = await response.json();
         //If response from server ok, update view 
        if(data.responseStatus) {  
          this.#taskList.removeTask(data.id);
        }
        else {
            console.error("Database responseStatus false");
        }      
        }
        catch(e) {
           console.log(`Error when deleting task status: ${e.message}`);
        }
        this.refreshMessageElement();
    })
   }
   /**
    * Uses tasklist API to get number of tasks in view and then updates local message element with it
    */
   refreshMessageElement() {
    const num = this.#taskList.getNumtasks();
    if(num === 0) { //No tasks in view
        const message = this.#shadow.querySelector("#message");
        message.textContent = "No tasks found.";
       }
       else { //Tasks in view found
        const message = this.#shadow.querySelector("#message");
        message.textContent = `Found ${num} tasks.`;
       }
     }
}
customElements.define('task-view', TaskView);
