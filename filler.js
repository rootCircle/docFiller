// alert("Bruhhhhh multipler x10");
var inputs = document.querySelectorAll('input[type="text"], input[type="number"], input[type="email"]');

console.log(document.querySelectorAll("div[role=radio]"))

// Fill each input field with the value "bruh@gmail.com"
// Missed one include textarea etc, radios, checkbox
inputs.forEach(input => {
  console.log(input)
  input.value = "bruh@gmail.com";
  var inputEvent = new Event('input', { bubbles: true });
  input.dispatchEvent(inputEvent)
});

