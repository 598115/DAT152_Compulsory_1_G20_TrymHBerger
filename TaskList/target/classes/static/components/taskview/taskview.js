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

            this.#shadow.querySelector("button").addEventListener('click', (event) => {
                this.#taskBox.show();
            });

            /////////////////////////////////////RUN
            this.fetchAvailableStatuses();
            this.fetchTasks();    
            this.postNewTask();
        }

    /**
     * @public
     * Uses Ajax to retrieve all statuses in database and add them to view with tasklist and taskbox API
     */
    async fetchAvailableStatuses() { //Fetches from server
        
         try {
            const response = await fetch("api/allstatuses");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const dataArray = data.allstatuses;
            this.#taskBox.setStatuseslist(dataArray);
            this.#taskList.setStatuseslist(dataArray);
         }
       catch(e) {
          console.log(`Error when fetching statuses: ${e.message}`);
       }
    }

    /**
     * @public
     * Uses Ajax to retrieve all tasks in database and add them to view with tasklist API
     */
    async fetchTasks() {
        try {
            const response = await fetch("api/tasklist");
            if (!response.ok) {
                throw new Error(`HTTP error! Status: ${response.status}`);
            }
            const data = await response.json();
            const taskArray = data.tasks;
               if(taskArray.length === 0) {
                const message = this.#shadow.querySelector("#message");
                message.textContent = "No tasks found.";
               }
               else {
                for (let t of taskArray) {
                    this.#taskList.showTask(t);
                }
                const message = this.#shadow.querySelector("#message");
                message.textContent = this.#taskList.getNumtasks();
               }
            this.#shadow.querySelector("button").disabled = false;
         }
       catch(e) {
          console.log(`Error when fetching tasks: ${e.message}`);
       }
    }

   async postNewTask() {

        this.#taskBox.newtaskCallback(
       async (newEvent) => {        
            try{
                const config = {
                    'method': 'POST',
                    'headers': {'Content-Type': 'application/json; charset=utf-8'},
                    'body': JSON.stringify(newEvent)
                }
                const response = await fetch("api/task", config);
                if(response.ok) {
                    console.log(`Successfully added new task to database`);
                }
            }
            catch(e) {
                console.log(`Error when posting new task: ${e.message}`);
            }
      });
    }



}
customElements.define('task-view', TaskView);
