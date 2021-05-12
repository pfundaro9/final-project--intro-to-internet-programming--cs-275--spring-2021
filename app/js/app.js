window.onload = () => {
    let diamondSize = prompt("Please enter the size of the diamond");
//    let diamondSizeInt = parseInt(diamondSize);
    let diamondContainer1 = document.getElementById(`diamondContainer`);
    if (isNaN(diamondSize) || diamondSize === "" ){
        alert("That is not a number. Please try again");
    }else {
        let diamondSizeInt = parseInt(diamondSize);
    for (let i = 0; i <= diamondSizeInt; i++){
        for (let j = 1; j <= diamondSizeInt - i; j++){
            diamondContainer1.innerHTML += "&nbsp";
        }
        for (let j = 1; j <= i-1; j++){
            diamondContainer1.innerHTML += "*";
        }
        diamondContainer1.innerHTML += "<br>";
    }
    for (let i = diamondSizeInt - 1; i >= 1; i--){
        for (let j = 1; j <= diamondSizeInt - i; j++){
            diamondContainer1.innerHTML += "&nbsp";
        }
        for (let j = 1; j <= i-1; j++){
            diamondContainer1.innerHTML += "*";
        }
        diamondContainer1.innerHTML += "<br>";
    }
    diamondContainer1.classList.toggle("diamondContainer");
}
};
