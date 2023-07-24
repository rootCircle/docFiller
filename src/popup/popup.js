// call this to add event listeners to the extension DOM
function listenFillFormAction() {
  // select the filler-button
  const fillerButton = document.querySelector("#filler_button");

  // browser.tabs.query() gets the details of the tabs
  browser.tabs.query({ active: true, currentWindow: true }).then((tabs) => {
    // attach the event listener
    fillerButton.addEventListener("click", (e) => {
      // to the current tab content script, send the following message
      browser.tabs.sendMessage(tabs[0].id, {
        data: "FILL_FORM",
      });
    });
  });
}

// on opening the extension
browser.tabs
  .executeScript({ file: "/filler.bundle.js" }) // load the content script
  .then(listenFillFormAction) // attach the event listeners to extension
  .catch((err) => {
    const errorMsg = document.createElement("p");
    errorMsg.textContent = err;
    document.body.appendChild(errorMsg);
  }); // error reporting
