const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

const USUARIO_ADMIN = "Vanderlei";
const SENHA_ADMIN = "Lindo";

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuario = document.querySelector("#usuario").value.trim();
    const senha = document.querySelector("#senha").value;

    if (usuario === USUARIO_ADMIN && senha === SENHA_ADMIN) {
        sessionStorage.setItem("adminLogado", "true");
        window.location.href = "adm.html";
        return;
    }

    loginMessage.textContent = "Usuário ou senha incorretos.";
});