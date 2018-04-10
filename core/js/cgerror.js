function errormsg (error) {
    let errormsg_elem = document.getElementById('errormsg');
    errormsg_elem.style.display = 'block';
    errormsg_elem.innerHTML = error;
};
