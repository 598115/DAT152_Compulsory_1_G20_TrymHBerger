const template = document.createElement("template");
template.innerHTML = `
<link rel="stylesheet" type="text/css" href="${import.meta.url.match(/.*\//)[0]}/taskbox.css"/>
 <dialog>
   <!-- Modal content -->
    <span>&times;</span>
    <div>
        <div>Title:</div>
        <div>
            <input type="text" size="25" maxlength="80"
                placeholder="Task title" autofocus/>
       </div>
       <div>Status:</div><div><select></select></div>
    </div>
    <p><button type="submit">Add task</button></p>
 </dialog>
`;

/**
  * TaskBox
  * Manage view modal box with input for new tasks
  */
class TaskBox extends HTMLElement {
    #shadow
    constructor() {                                                              
        super();          
        this.#shadow = this.attachShadow({mode:"closed"});
        this.template = template.content.cloneNode(true);
        this.#shadow.append(this.template);

        const closeButton = this.#shadow.querySelector("span"); //Close box "X" listener
        closeButton.addEventListener('click', () => {
            this.#shadow.querySelector("dialog").close();
        });
    }
    
    /**
     * @public
     * Opens (shows) the modal box in the browser window.
     */
    show() { 
      this.#shadow.querySelector("dialog").showModal();
    }
    
    /**
     * Sets the list of possible task statuses.
     * @public
     * @param {Array} list 
     */
    setStatuseslist(list) {
      
        const select = this.#shadow.querySelector("select");
        //Iterate over statuses array
        for(let s of list) {
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
     * Adds a callback to run at click on the Add task button.
     * @public
     * @param {Function} callback 
     */
    newtaskCallback(callback) {

        const addButton = this.#shadow.querySelector("button");
        addButton.addEventListener('click', (event) => {

            const select = this.#shadow.querySelector("select");
            const selectedOption = select.options[select.selectedIndex].textContent;
            const title = this.#shadow.querySelector("input").value;
            console.log(`Option: ${selectedOption} Title: ${title}`);
            const newEvent = {"title": title, "status": selectedOption};
            callback(newEvent);
        });
        
    }

    /**
     * Removes the modal box from the view.
     */
    close() {
        this.#shadow.querySelector("dialog").close();
    }
    
}
customElements.define('task-box', TaskBox);  