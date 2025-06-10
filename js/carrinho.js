const carrinhoContainer = document.getElementById('carrinhoContainer');
const trocoDiv = document.getElementById('trocoDiv');
const enderecoEntrega = document.getElementById('enderecoEntrega');
const trocoInput = document.getElementById('troco');
const enderecoInput = document.getElementById('endereco');

let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

function atualizarCarrinho() {
  carrinhoContainer.innerHTML = '';

  if (carrinho.length === 0) {
    carrinhoContainer.innerHTML = '<p>Seu carrinho está vazio.</p>';
    return;
  }

  carrinho.forEach((item, index) => {
    const itemDiv = document.createElement('div');
    itemDiv.classList.add('item-carrinho');

    itemDiv.innerHTML = `
      <strong>${item.nome}</strong><br>
      Preço unitário: R$ ${item.preco.toFixed(2).replace('.', ',')}<br>
      Quantidade: <input type="number" min="1" value="${item.quantidade}" onchange="alterarQuantidade(${index}, this.value)" />
      <button onclick="removerItem(${index})" style="margin-left: 10px;">Remover</button>
    `;

    carrinhoContainer.appendChild(itemDiv);
  });

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  const totalDiv = document.createElement('div');
  totalDiv.style.marginTop = '15px';
  totalDiv.style.fontWeight = 'bold';
  totalDiv.innerHTML = `Total: R$ ${total.toFixed(2).replace('.', ',')}`;
  carrinhoContainer.appendChild(totalDiv);
}

function removerItem(index) {
  carrinho.splice(index, 1);
  salvarCarrinho();
  atualizarCarrinho();
}

function alterarQuantidade(index, novaQtd) {
  const qtd = parseInt(novaQtd);
  if (isNaN(qtd) || qtd < 1) return;
  carrinho[index].quantidade = qtd;
  salvarCarrinho();
  atualizarCarrinho();
}

function salvarCarrinho() {
  localStorage.setItem('carrinho', JSON.stringify(carrinho));
}

document.querySelectorAll('input[name="pagamento"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const pagamentoSelecionado = document.querySelector('input[name="pagamento"]:checked').value;
    trocoDiv.style.display = pagamentoSelecionado === 'dinheiro' ? 'block' : 'none';
  });
});

document.querySelectorAll('input[name="entrega"]').forEach(radio => {
  radio.addEventListener('change', () => {
    const entregaSelecionada = document.querySelector('input[name="entrega"]:checked').value;
    enderecoEntrega.style.display = entregaSelecionada === 'entrega' ? 'block' : 'none';
  });
});

function enviarPedidoWhatsApp() {
  if (carrinho.length === 0) {
    alert('Seu carrinho está vazio!');
    return;
  }

  const pagamento = document.querySelector('input[name="pagamento"]:checked');
  const entrega = document.querySelector('input[name="entrega"]:checked');
  const troco = trocoInput.value.trim();
  const endereco = enderecoInput.value.trim();

  if (!pagamento) {
    alert('Por favor, selecione uma forma de pagamento.');
    return;
  }

  if (!entrega) {
    alert('Por favor, selecione uma forma de entrega.');
    return;
  }

  if (entrega.value === 'entrega' && endereco.length === 0) {
    alert('Por favor, informe o endereço para entrega.');
    return;
  }

  // Monta a mensagem do pedido
  let mensagem = '*Pedido Hortifruti Damasceno\'s*%0A%0A';

  carrinho.forEach(item => {
    mensagem += `${item.nome} - ${item.quantidade} x R$ ${item.preco.toFixed(2).replace('.', ',')} = R$ ${(item.preco * item.quantidade).toFixed(2).replace('.', ',')}%0A`;
  });

  const total = carrinho.reduce((acc, item) => acc + item.preco * item.quantidade, 0);
  mensagem += `%0ATotal: R$ ${total.toFixed(2).replace('.', ',')}%0A%0A`;

  mensagem += `*Entrega:* ${entrega.value === 'entrega' ? 'Endereço: ' + endereco : 'Retirada no local'}%0A`;
  mensagem += `*Pagamento:* ${pagamento.value === 'dinheiro' ? 'Dinheiro' : pagamento.value.charAt(0).toUpperCase() + pagamento.value.slice(1)}%0A`;

  if (pagamento.value === 'dinheiro' && troco.length > 0) {
    mensagem += `*Troco para:* R$ ${troco.replace('.', ',')}%0A`;
  }

  // Número do WhatsApp (substitua pelo seu número real)
  const numeroWhatsApp = '5514998106415';

  // Abre o WhatsApp com a mensagem
  window.open(`https://wa.me/${numeroWhatsApp}?text=${mensagem}`, '_blank');
}

document.getElementById('btnVoltarCatalogo').addEventListener('click', () => {
  voltarParaCatalogo();
});

function voltarParaCatalogo() {
  window.location.href = 'index.html';
}

// Atualiza o carrinho ao carregar a página
atualizarCarrinho();
