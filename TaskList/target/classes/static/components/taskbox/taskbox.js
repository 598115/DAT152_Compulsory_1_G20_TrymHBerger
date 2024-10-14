
/**
  * TaskBox
  * Manage view modal box with input for new tasks
  */
class TaskBox extends HTMLElement {
    #shadow
    #template
    constructor() {                                                              
        super();          
        this.#shadow = this.attachShadow({mode:"closed"});
        this.#template = this.#createTemplate().content.cloneNode(true);
        this.#shadow.append(this.#template);

        const closeButton = this.#shadow.querySelector("span"); //Close box "X" listener
        closeButton.addEventListener('click', () => {
            this.#shadow.querySelector("dialog").close();
        });
    }
    
    /**API
     * @public
     * Opens (shows) the modal box in the browser window.
     */
    show() { 
      this.#shadow.querySelector("dialog").showModal();
    }
    
    /**API
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

    /**API
     * Adds a callback to run at click on the Add task button.
     * @public
     * @param {Function} callback 
     */
    newtaskCallback(callback) {
      
        const addButton = this.#shadow.querySelector("button");
        addButton.addEventListener('click', (event) => {

            //Get the inputted data
            const select = this.#shadow.querySelector("select");
            const selectedOption = select.options[select.selectedIndex].textContent;
            const title = this.#shadow.querySelector("input");
            const newEvent = {"title": title.value, "status": selectedOption};
            //Clear selections in view
            title.value = "";
            select.selectedIndex = 0;
            //Send new event data and close box
            this.close()
            callback(newEvent);
        });     
    }

    /**API
     * @public
     * Removes the modal box from the view.
     */
    close() {
        this.#shadow.querySelector("dialog").close();
    }

    /**
     * @Private
     * @returns html template for module
     */
    #createTemplate() {
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
    return template;
    }
    
}
customElements.define('task-box', TaskBox);  