export default class tabControl {
    constructor(){
        this.tabs =null;
    }
    init(){
        this.tabs = document.querySelectorAll("[role=tab]");
        this.tabs.forEach((tabButton) => {
            tabButton.addEventListener("click", (e) => {
              e.preventDefault();
              const tabContainer = e.target.parentElement.parentElement;
              const targetId = e.target.getAttribute("aria-controls");
              this.tabs.forEach((_tabButton) =>
                _tabButton.setAttribute("aria-selected", false)
              );
              tabButton.setAttribute("aria-selected", true);
              tabContainer
                .querySelectorAll("[role=tabpanel]")
                .forEach((tabPanel) => tabPanel.setAttribute("hidden", true));
              tabContainer
                .querySelector(`[role=tabpanel]#${targetId}`)
                .removeAttribute("hidden");
            });
        });
    }
}