document.addEventListener('DOMContentLoaded', () => {
  const productList = document.getElementById('productList');
  const categoryList = document.getElementById('categoryList');
  const searchInput = document.getElementById('searchInput');

  let allProducts = [];
  let currentPage = 1;
  const productsPerPage = 9;

  async function initializeCatalog() {
    try {
      const response = await fetch('data/produtos.json');
      if (!response.ok) {
        throw new Error(`Erro ao carregar o ficheiro JSON! Status: ${response.status}`);
      }

      const data = await response.json();
      allProducts = data;

      displayProducts(allProducts);
      setupCategories(allProducts);
    } catch (error) {
      console.error("ERRO:", error);
      productList.innerHTML = `
        <div style="text-align: center; padding: 20px; color: red; width: 100%;">
          <h2>Ocorreu um erro ao carregar os produtos.</h2>
          <p>Verifique o console (pressione F12) para mais detalhes.</p>
          <p>Possível causa: O ficheiro <strong>/data/produtos.json</strong> não foi encontrado.</p>
        </div>
      `;
    }
  }

  function displayProducts(productsToDisplay) {
    productList.innerHTML = '';

    if (productsToDisplay.length === 0) {
      productList.innerHTML = '<p>Nenhum produto encontrado com os critérios selecionados.</p>';
      return;
    }

    const start = (currentPage - 1) * productsPerPage;
    const end = start + productsPerPage;
    const paginatedProducts = productsToDisplay.slice(start, end);

    paginatedProducts.forEach(product => {
      const productElement = document.createElement('div');
      productElement.className = 'product-card';

      const disponivel = product.disponivel !== false;

      productElement.innerHTML = `
        <img src="${product.imagem}" alt="${product.nome}" 
          onerror="this.src='https://placehold.co/300x200/e0e0e0/ffffff?text=Imagem+Inválida'; this.onerror=null;">
        <h3>${product.nome}</h3>
        <p class="price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
        <p>${product.descricao || ''}</p>
        ${!disponivel ? '<p style="color: red; font-weight: bold;">Indisponível</p>' : ''}
        <div style="text-align: center; margin-top: 8px;">
          <label for="qtd-${product.id}" style="display: block;">Quantidade:</label>
          <input type="number" id="qtd-${product.id}" min="1" value="1"
            style="width: 50px; padding: 4px; font-size: 14px; margin: 0 auto; display: block;"
            ${!disponivel ? 'disabled' : ''}>
        </div>
        <button 
          onclick="adicionarCarrinho('${product.id}', '${product.nome}', ${product.preco})"
          ${!disponivel ? 'disabled style="background-color: #ccc; cursor: not-allowed;"' : ''}>
          ${!disponivel ? 'Indisponível' : 'Adicionar ao Carrinho'}
        </button>
      `;
      productList.appendChild(productElement);
    });

    renderPagination(productsToDisplay);
  }

  function renderPagination(products) {
    let pagination = document.getElementById('pagination');
    if (!pagination) {
      pagination = document.createElement('div');
      pagination.id = 'pagination';
      pagination.style.textAlign = 'center';
      pagination.style.margin = '20px';
      productList.parentNode.appendChild(pagination);
    }
    pagination.innerHTML = '';

    const totalPages = Math.ceil(products.length / productsPerPage);

    for (let i = 1; i <= totalPages; i++) {
      const btn = document.createElement('button');
      btn.textContent = i;
      btn.style.margin = '5px';
      btn.style.padding = '8px 14px';
      btn.style.backgroundColor = i === currentPage ? '#333' : '#ccc';
      btn.style.color = 'white';
      btn.style.border = 'none';
      btn.style.borderRadius = '6px';
      btn.style.cursor = 'pointer';

      btn.addEventListener('click', () => {
        currentPage = i;
        displayProducts(allProducts);
      });

      pagination.appendChild(btn);
    }
  }

  function setupCategories(products) {
    const categories = ['Todas', ...new Set(products.map(p => p.categoria))];
    categoryList.innerHTML = '';

    categories.forEach(category => {
      const li = document.createElement('li');
      const link = document.createElement('a');
      link.href = '#';
      link.textContent = category;

      link.addEventListener('click', (event) => {
        event.preventDefault();
        currentPage = 1;
        const filtered = category === 'Todas'
          ? allProducts
          : allProducts.filter(p => p.categoria === category);
        displayProducts(filtered);
      });

      li.appendChild(link);
      categoryList.appendChild(li);
    });
  }

  searchInput.addEventListener('input', () => {
    const searchTerm = searchInput.value.toLowerCase();
    currentPage = 1;
    const filteredProducts = allProducts.filter(p =>
      p.nome.toLowerCase().includes(searchTerm) ||
      (p.descricao && p.descricao.toLowerCase().includes(searchTerm))
    );
    displayProducts(filteredProducts);
  });

  initializeCatalog();
});

// Função global para adicionar produto ao carrinho
function adicionarCarrinho(id, nome, preco) {
  const inputQtd = document.getElementById(`qtd-${id}`);
  const quantidade = parseInt(inputQtd.value);

  if (isNaN(quantidade) || quantidade <= 0) {
    alert('Informe uma quantidade válida.');
    return;
  }

  let carrinho = JSON.parse(localStorage.getItem('carrinho')) || [];

  const existente = carrinho.find(item => item.id === id);
  if (existente) {
    existente.quantidade += quantidade;
  } else {
    carrinho.push({ id, nome, preco, quantidade });
  }

  localStorage.setItem('carrinho', JSON.stringify(carrinho));
  alert('Produto adicionado ao carrinho!');
}
