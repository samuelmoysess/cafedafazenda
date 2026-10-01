const adminLogado = sessionStorage.getItem("adminLogado");

if (adminLogado !== "true") {
    window.location.href = "login-adm.html";
}

const ordersContainer = document.querySelector("#ordersContainer");
const logoutButton = document.querySelector("#logoutButton");
const clearOrdersButton = document.querySelector("#clearOrdersButton");

function carregarPedidos() {
    const pedidos = JSON.parse(localStorage.getItem("pedidos") || "[]");

    if (pedidos.length === 0) {
        ordersContainer.innerHTML = `
            <div class="no-orders">
                <h3>Nenhum pedido recebido</h3>
                <p>Os novos pedidos aparecerão nesta tela.</p>
            </div>
        `;

        return;
    }

    ordersContainer.innerHTML = pedidos
        .slice()
        .reverse()
        .map((pedido, index) => {

            const produtos = pedido.produtos || [];

            const listaProdutos = produtos.map((produto) => `
                <li>
                    <span>
                        ${produto.quantidade}x ${produto.nome}
                    </span>

                    <strong>
                        R$ ${Number(produto.subtotal).toFixed(2).replace(".", ",")}
                    </strong>
                </li>
            `).join("");

            return `
                <article class="order-admin-card">

                    <div class="order-admin-header">
                        <h3>
                            Pedido #${pedidos.length - index}
                        </h3>

                        <span class="order-date">
                            ${pedido.data || "Data não informada"}
                        </span>
                    </div>

                    <div class="order-client">

                        <div>
                            <strong>Cliente</strong>
                            <span>${pedido.nome || "Não informado"}</span>
                        </div>

                        <div>
                            <strong>Telefone</strong>
                            <span>${pedido.telefone || "Não informado"}</span>
                        </div>

                        <div>
                            <strong>Pagamento</strong>
                            <span>${pedido.pagamento || "Não informado"}</span>
                        </div>

                    </div>

                    <ul class="order-products">
                        ${listaProdutos}
                    </ul>

                    ${
                        pedido.observacoes
                            ? `<p><strong>Observações:</strong> ${pedido.observacoes}</p>`
                            : ""
                    }

                    <div class="order-admin-footer">
                        <span class="order-status">
                            Novo pedido
                        </span>

                        <strong class="order-total">
                            Total: R$ ${Number(pedido.total || 0)
                                .toFixed(2)
                                .replace(".", ",")}
                        </strong>
                    </div>

                </article>
            `;
        })
        .join("");
}

logoutButton.addEventListener("click", function () {
    sessionStorage.removeItem("adminLogado");
    window.location.href = "login-adm.html";
});

clearOrdersButton.addEventListener("click", function () {
    const confirmar = confirm("Deseja apagar todos os pedidos?");

    if (confirmar) {
        localStorage.removeItem("pedidos");
        carregarPedidos();
    }
});

carregarPedidos();