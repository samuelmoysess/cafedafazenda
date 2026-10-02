
document.addEventListener("DOMContentLoaded", () => {
    const produtos = document.querySelectorAll(".order-product");
    const cartItems = document.getElementById("cartItems");
    const totalElement = document.getElementById("total");
    const finalizarBotao = document.getElementById("finalizarPedido");
    const mensagem = document.getElementById("orderMessage");

    const campoNome = document.getElementById("nome");
    const campoTelefone = document.getElementById("telefone");
    const campoPagamento = document.getElementById("pagamento");
    const campoObservacoes = document.getElementById("observacoes");

    // Impede erros caso algum elemento não exista na página.
    if (
        !cartItems ||
        !totalElement ||
        !finalizarBotao ||
        !mensagem ||
        !campoNome ||
        !campoTelefone ||
        !campoPagamento ||
        !campoObservacoes
    ) {
        console.error("Erro: elementos do pedido não encontrados.");
        return;
    }

    const formatarMoeda = (valor) =>
        valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });

    function obterItensCarrinho() {
        const itens = [];

        produtos.forEach((produto) => {
            const quantidadeElemento =
                produto.querySelector(".quantity-value");

            if (!quantidadeElemento) return;

            const quantidade =
                Number.parseInt(quantidadeElemento.textContent, 10) || 0;

            const nome = produto.dataset.name || "Produto";
            const preco = Number.parseFloat(produto.dataset.price);

            if (
                quantidade > 0 &&
                Number.isFinite(preco) &&
                preco >= 0
            ) {
                itens.push({
                    nome,
                    quantidade,
                    preco,
                    subtotal: quantidade * preco
                });
            }
        });

        return itens;
    }

    function atualizarPedido() {
        const itens = obterItensCarrinho();

        cartItems.replaceChildren();

        if (itens.length === 0) {
            const vazio = document.createElement("div");
            vazio.className = "empty-cart";

            const icone = document.createElement("span");
            icone.textContent = "☕";

            const texto = document.createElement("p");
            texto.textContent = "Seu pedido está vazio.";

            const detalhe = document.createElement("small");
            detalhe.textContent =
                "Escolha um produto para começar.";

            vazio.append(icone, texto, detalhe);
            cartItems.appendChild(vazio);
        } else {
            itens.forEach((item) => {
                const linha = document.createElement("div");
                linha.className = "cart-item";

                const detalhes = document.createElement("div");

                const nome = document.createElement("strong");
                nome.textContent = item.nome;

                const quantidade = document.createElement("small");
                quantidade.textContent =
                    `${item.quantidade}x ${formatarMoeda(item.preco)}`;

                detalhes.append(nome, quantidade);

                const subtotal = document.createElement("span");
                subtotal.textContent = formatarMoeda(item.subtotal);

                linha.append(detalhes, subtotal);
                cartItems.appendChild(linha);
            });
        }

        const total = itens.reduce(
            (soma, item) => soma + item.subtotal,
            0
        );

        totalElement.textContent = formatarMoeda(total);

        return { itens, total };
    }

    function mostrarMensagem(texto, tipo) {
        mensagem.textContent = texto;
        mensagem.className = `order-message ${tipo}`;
    }

    // Botões de adicionar e remover produtos.
    produtos.forEach((produto) => {
        const mais = produto.querySelector(".plus");
        const menos = produto.querySelector(".minus");
        const quantidade = produto.querySelector(".quantity-value");

        if (!mais || !menos || !quantidade) return;

        mais.addEventListener("click", () => {
            const atual = Number.parseInt(quantidade.textContent, 10) || 0;
            quantidade.textContent = atual + 1;

            atualizarPedido();
            mensagem.textContent = "";
        });

        menos.addEventListener("click", () => {
            const atual = Number.parseInt(quantidade.textContent, 10) || 0;

            if (atual > 0) {
                quantidade.textContent = atual - 1;
                atualizarPedido();
                mensagem.textContent = "";
            }
        });
    });

    // Finalização do pedido.
    finalizarBotao.addEventListener("click", () => {
        const nome = campoNome.value.trim();
        const telefone = campoTelefone.value.trim();
        const pagamento = campoPagamento.value;
        const observacoes = campoObservacoes.value.trim();

        const { itens, total } = atualizarPedido();

        if (!nome) {
            mostrarMensagem("Digite seu nome para continuar.", "error");
            campoNome.focus();
            return;
        }

        if (!telefone || telefone.replace(/\D/g, "").length < 10) {
            mostrarMensagem(
                "Digite um telefone válido com DDD.",
                "error"
            );
            campoTelefone.focus();
            return;
        }

        if (!pagamento) {
            mostrarMensagem(
                "Escolha uma forma de pagamento.",
                "error"
            );
            campoPagamento.focus();
            return;
        }

        if (itens.length === 0 || total <= 0) {
            mostrarMensagem(
                "Adicione pelo menos um produto ao pedido.",
                "error"
            );
            return;
        }

        const pedido = {
            id: `${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
            nome,
            telefone,
            pagamento,
            observacoes,
            total,
            data: new Date().toLocaleString("pt-BR"),
            produtos: itens,
            status: "Novo pedido"
        };

        try {
            const pedidosSalvos = JSON.parse(
                localStorage.getItem("pedidos") || "[]"
            );

            if (!Array.isArray(pedidosSalvos)) {
                throw new Error("Formato de pedidos inválido.");
            }

            pedidosSalvos.push(pedido);

            localStorage.setItem(
                "pedidos",
                JSON.stringify(pedidosSalvos)
            );

            mostrarMensagem(
                `Pedido realizado com sucesso! Total: ${formatarMoeda(total)}. ` +
                "Os dados foram salvos neste navegador.",
                "success"
            );

            // Limpa o carrinho depois de salvar.
            produtos.forEach((produto) => {
                const quantidade =
                    produto.querySelector(".quantity-value");

                if (quantidade) {
                    quantidade.textContent = "0";
                }
            });

            atualizarPedido();

            campoNome.value = "";
            campoTelefone.value = "";
            campoPagamento.value = "";
            campoObservacoes.value = "";

        } catch (erro) {
            console.error("Erro ao salvar pedido:", erro);

            mostrarMensagem(
                "Não foi possível salvar o pedido. Tente novamente.",
                "error"
            );
        }
    });

    // Atualiza o carrinho ao abrir a página.
    atualizarPedido();
});