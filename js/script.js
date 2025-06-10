document.addEventListener('DOMContentLoaded', () => {
    const productList = document.getElementById('productList');
    const categoryList = document.getElementById('categoryList');
    const searchInput = document.getElementById('searchInput');

    let allProducts = [];

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

        productsToDisplay.forEach(product => {
            const productElement = document.createElement('div');
            productElement.className = 'product-card';
            productElement.innerHTML = `
                <img src="${product.imagem}" alt="${product.nome}" onerror="this.src='https://placehold.co/300x200/e0e0e0/ffffff?text=Imagem+Inválida'; this.onerror=null;">
                <h3>${product.nome}</h3>
                <p class="price">R$ ${product.preco.toFixed(2).replace('.', ',')}</p>
                <p>${product.descricao || ''}</p>
                <label for="qtd-${product.id}">Quantidade:</label>
                <input type="number" id="qtd-${product.id}" min="1" value="1">
                <button onclick="adicionarCarrinho('${product.id}', '${product.nome}', ${product.preco})">Adicionar ao Carrinho</button>
            `;
            productList.appendChild(productElement);
        });
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
