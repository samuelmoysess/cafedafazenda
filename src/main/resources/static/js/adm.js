const loginForm = document.querySelector("#loginForm");
const loginMessage = document.querySelector("#loginMessage");

const USUARIO_ADMIN = "vanderlei";
const SENHA_ADMIN = "1234";

loginForm.addEventListener("submit", function (event) {
    event.preventDefault();

    const usuario = document.querySelector("#usuario").value.trim();
    const senha = document.querySelector("#senha").value;

    if (usuario === USUARIO_ADMIN && senha === SENHA_ADMIN) {

        sessionStorage.setItem("adminLogado", "true");

        window.location.href = "gestao.html";

        return;
    }

    loginMessage.textContent = "Usuário ou senha incorretos.";
});