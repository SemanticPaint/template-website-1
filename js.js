var password = "TyCool123"; // because ANYONE CAN SEE THIS IN VIEW SOURCE!


// Repeatedly prompt for user password until success:
(function promptPass() {

  var psw = prompt("Enter your Password");

  while (psw !== password) {
    alert("Incorrect Password");
    return promptPass();
  }

}());


alert('WELCOME');