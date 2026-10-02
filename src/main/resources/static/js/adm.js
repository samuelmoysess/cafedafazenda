
document.addEventListener("DOMContentLoaded", () => {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES E ELEMENTOS DO PAINEL
    // ==========================================

    const CHAVE_PEDIDOS = "pedidos";
    const CHAVE_ADMIN = "adminLogado";

    const ordersContainer = document.getElementById("ordersContainer");
    const logoutButton = document.getElementById("logoutButton");
    const clearOrdersButton = document.getElementById("clearOrdersButton");

    // ==========================================
    // VERIFICAÇÃO DE ACESSO
    // ==========================================

    if (sessionStorage.getItem(CHAVE_ADMIN) !== "true") {
        window.location.href = "login-adm.html";
        return;
    }

    if (!ordersContainer || !logoutButton || !clearOrdersButton) {
        console.error(
            "Não foi possível encontrar todos os elementos do painel administrativo."
        );
        return;
    }

    // ==========================================
    // FUNÇÕES AUXILIARES
    // ==========================================

    function formatarMoeda(valor) {
        const numero = Number(valor);

        return (Number.isFinite(numero) ? numero : 0).toLocaleString(
            "pt-BR",
            {
                style: "currency",
                currency: "BRL"
            }
        );
    }

    function criarElemento(tag, classe, texto) {
        const elemento = document.createElement(tag);

        if (classe) {
            elemento.className = classe;
        }

        if (texto !== undefined && texto !== null) {
            elemento.textContent = String(texto);
        }

        return elemento;
    }

    function lerPedidos() {
        try {
            const dados = localStorage.getItem(CHAVE_PEDIDOS);

            if (!dados) {
                return [];
            }

            const pedidos = JSON.parse(dados);

            if (!Array.isArray(pedidos)) {
                console.error("A lista de pedidos não é válida.");
                return [];
            }

            return pedidos.filter(
                pedido =>
                    pedido !== null &&
                    typeof pedido === "object" &&
                    !Array.isArray(pedido)
            );
        } catch (erro) {
            console.error("Erro ao carregar pedidos:", erro);
            return null;
        }
    }

    function mostrarAviso(texto, tipo = "error") {
        let aviso = document.getElementById("adminMessage");

        if (!aviso) {
            aviso = criarElemento("div", "admin-message");
            aviso.id = "adminMessage";
            aviso.setAttribute("role", "status");

            ordersContainer.parentNode.insertBefore(
                aviso,
                ordersContainer
            );
        }

        aviso.className = `admin-message ${tipo}`;
        aviso.textContent = texto;
    }

    function ocultarAviso() {
        const aviso = document.getElementById("adminMessage");

        if (aviso) {
            aviso.remove();
        }
    }

    // ==========================================
    // LISTA DE PRODUTOS DO PEDIDO
    // ==========================================

    function criarListaProdutos(produtos) {
        const lista = criarElemento("ul", "order-products");

        if (!Array.isArray(produtos) || produtos.length === 0) {
            lista.appendChild(
                criarElemento("li", "", "Nenhum produto informado.")
            );

            return lista;
        }

        produtos.forEach(produto => {
            if (!produto || typeof produto !== "object") {
                return;
            }

            const quantidade = Number(produto.quantidade) || 0;
            const nome = produto.nome || "Produto";
            const preco = Number(produto.preco);
            const subtotalInformado = Number(produto.subtotal);

            const subtotal = Number.isFinite(subtotalInformado)
                ? subtotalInformado
                : quantidade * (
                    Number.isFinite(preco) ? preco : 0
                );

            const item = criarElemento("li", "");

            const descricao = criarElemento(
                "span",
                "",
                `${quantidade}x ${nome}`
            );

            const valor = criarElemento(
                "strong",
                "",
                formatarMoeda(subtotal)
            );

            item.append(descricao, valor);
            lista.appendChild(item);
        });

        return lista;
    }

    // ==========================================
    // CARTÃO DE CADA PEDIDO
    // ==========================================

    function criarCartaoPedido(pedido, numero) {
        const cartao = criarElemento("article", "order-admin-card");

        const cabecalho = criarElemento("div", "order-admin-header");

        const titulo = criarElemento(
            "h3",
            "",
            `Pedido #${numero}`
        );

        const data = criarElemento(
            "span",
            "order-date",
            pedido.data || "Data não informada"
        );

        cabecalho.append(titulo, data);

        // Informações do cliente
        const cliente = criarElemento("div", "order-client");

        const informacoes = [
            ["Cliente", pedido.nome || "Não informado"],
            ["Telefone", pedido.telefone || "Não informado"],
            ["Pagamento", pedido.pagamento || "Não informado"]
        ];

        informacoes.forEach(([rotulo, valor]) => {
            const grupo = criarElemento("div");

            grupo.append(
                criarElemento("strong", "", rotulo),
                criarElemento("span", "", valor)
            );

            cliente.appendChild(grupo);
        });

        // Produtos
        const produtos = criarListaProdutos(pedido.produtos);

        // Observações
        const conteudo = document.createElement("div");

        if (pedido.observacoes) {
            const observacoes = criarElemento("p", "");

            observacoes.appendChild(
                criarElemento("strong", "", "Observações: ")
            );

            observacoes.appendChild(
                document.createTextNode(String(pedido.observacoes))
            );

            conteudo.appendChild(observacoes);
        }

        // Rodapé
        const rodape = criarElemento("div", "order-admin-footer");

        const status = criarElemento(
            "span",
            "order-status",
            pedido.status || "Novo pedido"
        );

        const total = criarElemento(
            "strong",
            "order-total",
            `Total: ${formatarMoeda(pedido.total)}`
        );

        rodape.append(status, total);

        // Botão para atualizar o status
        const acoes = criarElemento("div", "order-admin-actions");

        const botaoStatus = criarElemento(
            "button",
            "status-button",
            pedido.status === "Concluído"
                ? "Marcar como novo"
                : "Marcar como concluído"
        );

        botaoStatus.type = "button";

        botaoStatus.addEventListener("click", () => {
            atualizarStatus(pedido, numero);
        });

        acoes.appendChild(botaoStatus);

        // Monta o cartão
        cartao.append(
            cabecalho,
            cliente,
            produtos,
            conteudo,
            rodape,
            acoes
        );

        return cartao;
    }

    // ==========================================
    // CARREGAR E EXIBIR PEDIDOS
    // ==========================================

    function carregarPedidos() {
        ocultarAviso();

        const pedidos = lerPedidos();

        if (pedidos === null) {
            mostrarAviso(
                "Não foi possível ler os pedidos armazenados.",
                "error"
            );
            return;
        }

        ordersContainer.replaceChildren();

        if (pedidos.length === 0) {
            const vazio = criarElemento("div", "no-orders");

            vazio.append(
                criarElemento("h3", "", "Nenhum pedido recebido"),
                criarElemento(
                    "p",
                    "",
                    "Os novos pedidos aparecerão nesta tela."
                )
            );

            ordersContainer.appendChild(vazio);
            return;
        }

        // Mostra os pedidos mais recentes primeiro.
        const pedidosOrdenados = pedidos
            .map((pedido, indice) => ({
                pedido,
                indice
            }))
            .reverse();

        pedidosOrdenados.forEach(({ pedido, indice }) => {
            const cartao = criarCartaoPedido(
                pedido,
                indice + 1
            );

            ordersContainer.appendChild(cartao);
        });
    }

    // ==========================================
    // ATUALIZAR STATUS DO PEDIDO
    // ==========================================

    function atualizarStatus(pedidoAtual, indice) {
        const pedidos = lerPedidos();

        if (pedidos === null || !pedidos[indice]) {
            mostrarAviso(
                "Não foi possível atualizar este pedido.",
                "error"
            );
            return;
        }

        const pedido = pedidos[indice];

        // Evita atualizar outro pedido por engano.
        if (
            pedidoAtual.id &&
            pedido.id !== pedidoAtual.id
        ) {
            mostrarAviso(
                "A lista mudou. Atualize o painel e tente novamente.",
                "error"
            );
            carregarPedidos();
            return;
        }

        pedido.status = pedido.status === "Concluído"
            ? "Novo pedido"
            : "Concluído";

        try {
            localStorage.setItem(
                CHAVE_PEDIDOS,
                JSON.stringify(pedidos)
            );

            carregarPedidos();
        } catch (erro) {
            console.error("Erro ao atualizar status:", erro);

            mostrarAviso(
                "Não foi possível salvar a alteração do pedido.",
                "error"
            );
        }
    }

    // ==========================================
    // SAIR DO PAINEL
    // ==========================================

    logoutButton.addEventListener("click", () => {
        sessionStorage.removeItem(CHAVE_ADMIN);

        window.location.href = "login-adm.html";
    });

    // ==========================================
    // LIMPAR TODOS OS PEDIDOS
    // ==========================================

    clearOrdersButton.addEventListener("click", () => {
        const pedidos = lerPedidos();

        if (pedidos === null) {
            mostrarAviso(
                "Não foi possível verificar os pedidos.",
                "error"
            );
            return;
        }

        if (pedidos.length === 0) {
            mostrarAviso(
                "Não existem pedidos para apagar.",
                "info"
            );
            return;
        }

        const confirmar = window.confirm(
            `Deseja realmente apagar os ${pedidos.length} pedidos? ` +
            "Esta ação não poderá ser desfeita."
        );

        if (!confirmar) {
            return;
        }

        try {
            localStorage.removeItem(CHAVE_PEDIDOS);

            carregarPedidos();

            mostrarAviso(
                "Todos os pedidos foram removidos deste navegador.",
                "success"
            );
        } catch (erro) {
            console.error("Erro ao apagar pedidos:", erro);

            mostrarAviso(
                "Não foi possível apagar os pedidos.",
                "error"
            );
        }
    });

    // ==========================================
    // SINCRONIZAÇÃO ENTRE ABAS DO MESMO NAVEGADOR
    // ==========================================

    window.addEventListener("storage", evento => {
        if (evento.key === CHAVE_PEDIDOS) {
            carregarPedidos();
        }
    });

    // Primeira exibição do painel.
    carregarPedidos();
});