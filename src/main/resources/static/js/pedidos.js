document.addEventListener("DOMContentLoaded", () => {

    const produtos = [
        ...document.querySelectorAll(".order-product")
    ];

    const carrinho = document.getElementById("cartItems");
    const totalElemento = document.getElementById("total");
    const mensagem = document.getElementById("orderMessage");

    const formatarDinheiro = valor => {
        return valor.toLocaleString("pt-BR", {
            style: "currency",
            currency: "BRL"
        });
    };

    // ATUALIZA O RESUMO E O VALOR TOTAL
    function atualizarCarrinho() {

        const selecionados = produtos.map(produto => ({
            nome: produto.dataset.name,
            preco: Number(produto.dataset.price),
            quantidade: Number(
                produto.querySelector(".quantity-value").textContent
            )
        })).filter(item => item.quantidade > 0);

        carrinho.replaceChildren();

        if (selecionados.length === 0) {

            const vazio = document.createElement("div");
            vazio.className = "empty-cart";

            const texto = document.createElement("p");
            texto.textContent = "Seu pedido está vazio.";

            const dica = document.createElement("small");
            dica.textContent = "Escolha um produto para começar.";

            vazio.append(texto, dica);
            carrinho.appendChild(vazio);

        } else {

            selecionados.forEach(item => {

                const linha = document.createElement("div");
                linha.className = "cart-item";

                const nome = document.createElement("span");
                nome.textContent =
                    `${item.quantidade}x ${item.nome}`;

                const preco = document.createElement("strong");
                preco.textContent = formatarDinheiro(
                    item.preco * item.quantidade
                );

                linha.append(nome, preco);
                carrinho.appendChild(linha);
            });
        }

        const total = selecionados.reduce((soma, item) => {
            return soma + item.preco * item.quantidade;
        }, 0);

        totalElemento.textContent = formatarDinheiro(total);

        return {
            selecionados,
            total
        };
    }

    // BOTÃO DE ADICIONAR
    produtos.forEach(produto => {

        const quantidade = produto.querySelector(".quantity-value");
        const botaoMais = produto.querySelector(".plus");
        const botaoMenos = produto.querySelector(".minus");

        botaoMais.addEventListener("click", () => {

            quantidade.textContent =
                Number(quantidade.textContent) + 1;

            mensagem.textContent = "";
            atualizarCarrinho();
        });

        // BOTÃO DE DIMINUIR
        botaoMenos.addEventListener("click", () => {

            quantidade.textContent = Math.max(
                0,
                Number(quantidade.textContent) - 1
            );

            mensagem.textContent = "";
            atualizarCarrinho();
        });
    });

    // FINALIZAR PEDIDO
    document.getElementById("finalizarPedido")
        .addEventListener("click", () => {

            const { selecionados, total } = atualizarCarrinho();

            const nome = document.getElementById("nome")
                .value.trim();

            const telefone = document.getElementById("telefone")
                .value.trim();

            const pagamento = document.getElementById("pagamento")
                .value;

            const observacoes = document.getElementById("observacoes")
                .value.trim();

            if (selecionados.length === 0) {
                mensagem.textContent =
                    "Adicione pelo menos um produto ao pedido.";
                return;
            }

            if (!nome || !telefone || !pagamento) {
                mensagem.textContent =
                    "Preencha seu nome, telefone e forma de pagamento.";
                return;
            }

            const listaProdutos = selecionados.map(item => {
                return `• ${item.quantidade}x ${item.nome} - ${formatarDinheiro(item.preco * item.quantidade)
                    }`;
            }).join("\n");

            const textoPedido =
                `Olá! Quero fazer um pedido na Cafeteria da Fazenda.\n\n` +
                `Nome: ${nome}\n` +
                `Telefone: ${telefone}\n\n` +
                `${listaProdutos}\n\n` +
                `Total: ${formatarDinheiro(total)}\n` +
                `Pagamento: ${pagamento}` +
                (observacoes
                    ? `\nObservações: ${observacoes}`
                    : "");

            mensagem.textContent =
                "Pedido montado! O envio pelo WhatsApp precisa ser configurado.";

            console.info(textoPedido);
        });

    atualizarCarrinho();

});
