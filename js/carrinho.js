// Mostrar/ocultar campo Troco
document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
  radio.addEventListener("change", function () {
    const trocoDiv = document.getElementById("trocoDiv");
    trocoDiv.style.display = this.value === "dinheiro" ? "block" : "none";
  });
});

// Mostrar/ocultar campo Endereço
document.querySelectorAll('input[name="entrega"]').forEach(radio => {
  radio.addEventListener("change", function () {
    const enderecoDiv = document.getElementById("enderecoEntrega");
    enderecoDiv.style.display = this.value === "entrega" ? "block" : "none";
  });
});

// Função para renderizar o carrinho, permitindo editar/remover itens
function renderizarCarrinho() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];
  const container = document.getElementById("carrinhoContainer");
  container.innerHTML = ""; // Limpa conteúdo anterior

  if (carrinho.length === 0) {
    container.innerHTML = "<p>Seu carrinho está vazio.</p>";
    return;
  }

  let total = 0;

  carrinho.forEach((item, index) => {
    const divItem = document.createElement("div");
    divItem.className = "item-carrinho";

    const subtotal = item.preco * item.quantidade;
    total += subtotal;

    divItem.innerHTML = `
      <strong>${item.nome}</strong><br>
      Preço unitário: R$ ${item.preco.toFixed(2)}<br>
      Quantidade: 
      <input type="number" min="1" value="${item.quantidade}" data-index="${index}" class="input-quantidade" />
      <button data-index="${index}" class="btn-remover">Remover</button>
    `;

    container.appendChild(divItem);
  });

  // Exibe o total no final do carrinho
  const totalDiv = document.createElement("div");
  totalDiv.className = "total-carrinho";
  totalDiv.innerHTML = `<p><strong>Total: R$ ${total.toFixed(2)}</strong></p>`;
  container.appendChild(totalDiv);

  // Evento para alterar quantidade
  document.querySelectorAll(".input-quantidade").forEach(input => {
    input.addEventListener("change", (e) => {
      const idx = e.target.getAttribute("data-index");
      let novaQtd = parseInt(e.target.value);
      if (isNaN(novaQtd) || novaQtd < 1) {
        novaQtd = 1;
        e.target.value = 1;
      }
      carrinho[idx].quantidade = novaQtd;
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      renderizarCarrinho(); // Atualiza a tela para refletir mudanças
    });
  });

  // Evento para remover item
  document.querySelectorAll(".btn-remover").forEach(btn => {
    btn.addEventListener("click", (e) => {
      const idx = e.target.getAttribute("data-index");
      carrinho.splice(idx, 1);
      localStorage.setItem("carrinho", JSON.stringify(carrinho));
      renderizarCarrinho();
    });
  });
}

// Função para enviar o pedido via WhatsApp
function enviarPedidoWhatsApp() {
  const carrinho = JSON.parse(localStorage.getItem("carrinho")) || [];

  if (carrinho.length === 0) {
    alert("Seu carrinho está vazio.");
    return;
  }

  const pagamento = document.querySelector('input[name="pagamento"]:checked');
  const entrega = document.querySelector('input[name="entrega"]:checked');
  const troco = document.getElementById("troco").value;
  const endereco = document.getElementById("endereco").value.trim();

  const nomeCliente = document.getElementById("nomeCliente").value.trim();
  const telefoneCliente = document.getElementById("telefoneCliente").value.trim();
  const emailCliente = document.getElementById("emailCliente").value.trim();

  if (!nomeCliente || !telefoneCliente || !emailCliente) {
    alert("Por favor, preencha todos os dados do cliente.");
    return;
  }

  if (!pagamento || !entrega) {
    alert("Por favor, selecione a forma de pagamento e de entrega.");
    return;
  }

  if (entrega.value === "entrega" && endereco === "") {
    alert("Por favor, informe o endereço para entrega.");
    return;
  }

  let mensagem = `*Pedido Hortifruti Damasceno's*%0A`;
  let total = 0;

  carrinho.forEach(item => {
    mensagem += `- ${item.nome} (${item.quantidade}) - R$ ${item.preco.toFixed(2)}%0A`;
    total += item.preco * item.quantidade;
  });

  mensagem += `%0A*Total:* R$ ${total.toFixed(2)}%0A`;
  mensagem += `*Pagamento:* ${pagamento.value}%0A`;

  if (pagamento.value === "dinheiro" && troco) {
    mensagem += `*Troco para:* R$ ${parseFloat(troco).toFixed(2)}%0A`;
  }

  mensagem += `*Entrega:* ${entrega.value === "entrega" ? "Entrega em domicílio" : "Retirada na loja"}%0A`;

  if (entrega.value === "entrega" && endereco) {
    mensagem += `*Endereço:* ${endereco}%0A`;
  }

  mensagem += `%0A*Cliente:* ${nomeCliente}%0A*Telefone:* ${telefoneCliente}%0A*Email:* ${emailCliente}%0A`;

  // Salvar o pedido no localStorage
  const pedido = {
    nomeCliente,
    telefoneCliente,
    emailCliente,
    itens: carrinho,
    total: total.toFixed(2),
    pagamento: pagamento.value,
    troco: troco || null,
    entrega: entrega.value === "entrega" ? endereco : "Retirada",
    data: new Date().toLocaleString()
  };

  const pedidos = JSON.parse(localStorage.getItem("pedidos")) || [];
  pedidos.push(pedido);
  localStorage.setItem("pedidos", JSON.stringify(pedidos));

  // Redirecionar para WhatsApp
  const numeroLoja = "5514998106415"; // coloque seu número aqui com DDD e sem espaços
  const url = `https://wa.me/${numeroLoja}?text=${mensagem}`;
  window.open(url, "_blank");

  // Limpar carrinho após envio
  localStorage.removeItem("carrinho");
  renderizarCarrinho();
}

// Botão para voltar ao catálogo
document.getElementById('btnVoltarCatalogo').addEventListener('click', function () {
  window.location.href = 'index.html';
});

// Chama renderizarCarrinho ao carregar a página
renderizarCarrinho();
