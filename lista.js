document.addEventListener("DOMContentLoaded", () => {
  // Elementos da página
  const productList = document.getElementById("product-list");
  const modal = document.getElementById("confirm-modal");
  const btnYes = document.getElementById("btn-yes");
  const btnNo = document.getElementById("btn-no");
  const exportPrintBtn = document.getElementById("export-print");
  const userModal = document.getElementById("user-modal");
  const btnGenerate = document.getElementById("btn-generate");
  const btnCancel = document.getElementById("btn-cancel");
  const deleteAllModal = document.getElementById('delete-all-modal');
  const btnConfirmDeleteAll = document.getElementById('btn-confirm-delete-all');
  const btnCancelDeleteAll = document.getElementById('btn-cancel-delete-all');
  const editModal = document.getElementById("edit-modal");
  const btnCancelEdit = document.getElementById("btn-cancel-edit");
  const editForm = document.getElementById("edit-form");
  const footer = document.querySelector('.ftr');

  // Dados
  let products = JSON.parse(localStorage.getItem("products")) || [];
  let userName = "";
  let userSector = "";

  // --- FUNÇÕES DE CONTROLE DE MODAL E FOOTER ---
  function abrirModal(id) {
    const targetModal = document.getElementById(id);
    if (targetModal) {
      targetModal.classList.remove('hidden');
      footer.classList.add('hidden-ftr');
    }
  }

  function fecharModal(id) {
    const targetModal = document.getElementById(id);
    if (targetModal) {
      targetModal.classList.add('hidden');
      footer.classList.remove('hidden-ftr');
    }
  }

  // --- RENDERIZAÇÃO ---
  const renderProducts = () => {
    productList.innerHTML = '';
    if (products.length === 0) {
      productList.innerHTML = "<p>Nenhum produto cadastrado.</p>";
      return;
    }

    products.forEach(product => {
      const card = document.createElement("div");
      card.className = "product-card";
      card.innerHTML = `
        <div class="product-content">
          <p><strong>Nome:</strong> ${product.name}</p>
          <p><strong>Quantidade:</strong> ${product.quantity}</p>
          <p><strong>Validade:</strong> ${product.expiry}</p>
          <p><strong>Código EAN:</strong> ${product.barcode}</p>
        </div>
        <div class="action-container">
          <button class="edit-btn" data-id="${product.id}">Editar ✏️</button>
          <button class="delete-btn" data-id="${product.id}">Excluir 🗑️</button>
        </div>
      `;
      productList.appendChild(card);
    });
  };

  // --- EVENTOS DA LISTA (EDITAR E EXCLUIR UM) ---
  productList.addEventListener("click", (e) => {
    const id = Number(e.target.getAttribute("data-id"));
    const product = products.find(p => p.id === id);

    if (e.target.classList.contains("edit-btn") && product) {
      document.getElementById("edit-product-id").value = product.id;
      document.getElementById("edit-name").value = product.name;
      document.getElementById("edit-quantity").value = product.quantity;
      document.getElementById("edit-expiry").value = product.expiry;
      document.getElementById("edit-barcode").value = product.barcode;
      abrirModal("edit-modal");
    }

    if (e.target.classList.contains("delete-btn") && product) {
      // Injeta o nome do produto no modal de confirmação
      const nameDisplay = document.getElementById('delete-product-name');
      if (nameDisplay) nameDisplay.innerText = product.name;
      
      // Guarda o ID no botão SIM para a exclusão
      btnYes.setAttribute('data-id-to-delete', id);
      abrirModal("confirm-modal");
    }
  });

  // --- LÓGICA DE EXCLUSÃO INDIVIDUAL ---
  btnYes.addEventListener("click", () => {
    const idToDelete = Number(btnYes.getAttribute('data-id-to-delete'));
    products = products.filter(p => p.id !== idToDelete);
    localStorage.setItem("products", JSON.stringify(products));
    renderProducts();
    fecharModal("confirm-modal");
  });

  btnNo.addEventListener("click", () => fecharModal("confirm-modal"));

  // --- LÓGICA DE EDIÇÃO ---
  editForm.addEventListener("submit", (e) => {
    e.preventDefault();
    const productId = Number(document.getElementById("edit-product-id").value);
    const index = products.findIndex(p => p.id === productId);

    if (index !== -1) {
      products[index] = {
        id: productId,
        name: document.getElementById("edit-name").value.trim(),
        quantity: document.getElementById("edit-quantity").value.trim(),
        expiry: document.getElementById("edit-expiry").value,
        barcode: document.getElementById("edit-barcode").value.trim()
      };
      localStorage.setItem("products", JSON.stringify(products));
      renderProducts();
      fecharModal("edit-modal");
    }
  });

  btnCancelEdit.addEventListener("click", () => fecharModal("edit-modal"));

  // Formatação de data (Validade)
  document.getElementById('edit-expiry').addEventListener('input', (e) => {
    let value = e.target.value.replace(/\D/g, '');
    if (value.length > 2 && value.length <= 4) {
      value = value.substring(0, 2) + '/' + value.substring(2);
    } else if (value.length > 4) {
      value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
    }
    e.target.value = value.substring(0, 10);
  });

  // --- RELATÓRIO E IDENTIFICAÇÃO ---
  exportPrintBtn.addEventListener('click', () => {
    if (products.length === 0) {
      alert("Não há produtos para gerar relatório!");
      return;
    }
    abrirModal("user-modal");
  });

  btnCancel.addEventListener('click', () => fecharModal("user-modal"));

  btnGenerate.addEventListener('click', () => {
    userName = document.getElementById("user-name").value.trim();
    userSector = document.getElementById("user-sector").value;
    if (!userName || !userSector) {
      alert("Por favor, preencha todos os campos!");
      return;
    }
    fecharModal("user-modal");
    generateReport();
  });

  // --- EXCLUIR TUDO ---
  document.getElementById('delete-all-btn').addEventListener('click', () => {
    if (products.length === 0) {
      alert("Não há produtos para excluir!");
      return;
    }
    abrirModal('delete-all-modal');
  });

  btnConfirmDeleteAll.addEventListener('click', () => {
    localStorage.removeItem("products");
    products = [];
    renderProducts();
    fecharModal('delete-all-modal');
  });

  btnCancelDeleteAll.addEventListener('click', () => fecharModal('delete-all-modal'));

  // --- FUNÇÃO DO RELATÓRIO ---
  function generateReport() {
    const reportWindow = window.open('', '_blank');
    reportWindow.document.write(`
      <!DOCTYPE html>
      <html>
      <head>
        <title>Relatório de Produtos</title>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/pdfmake.min.js"></script>
        <script src="https://cdnjs.cloudflare.com/ajax/libs/pdfmake/0.2.7/vfs_fonts.js"></script>
        <style>
          body { font-family: Arial; margin: 20px; padding-bottom: 80px; }
          .report-header { text-align: center; margin-bottom: 25px; border-bottom: 1px solid #eee; padding-bottom: 15px; }
          h1 { color: #0066cc; }
          table { width: 100%; border-collapse: collapse; margin: 20px 0; }
          th, td { border: 1px solid #ddd; padding: 10px; text-align: left; }
          th { background-color: #0066cc; color: white; }
          .button-container { position: fixed; bottom: 0; left: 0; right: 0; background: white; padding: 15px; display: flex; justify-content: center; gap: 15px; box-shadow: 0 -2px 5px rgba(0,0,0,0.1); }
          .action-btn { padding: 12px 20px; border: none; border-radius: 5px; cursor: pointer; color: white; }
          .back-btn { background: #666; }
          .pdf-btn { background: #4CAF50; }
        </style>
      </head>
      <body>
        <div class="report-header">
          <h1>Relatório de Produtos</h1>
          <p><strong>Gerado por:</strong> ${userName}</p>
          <p><strong>Setor:</strong> ${userSector}</p>
          <p><strong>Data:</strong> ${new Date().toLocaleDateString('pt-BR')}</p>
        </div>
        <table>
          <thead><tr><th>Nome</th><th>Qtd</th><th>Validade</th><th>Código</th></tr></thead>
          <tbody>
            ${products.map(p => `<tr><td>${p.name}</td><td>${p.quantity}</td><td>${p.expiry}</td><td>${p.barcode}</td></tr>`).join('')}
          </tbody>
        </table>
        <div class="button-container">
          <button class="action-btn back-btn" onclick="window.close()">Voltar</button>
          <button class="action-btn pdf-btn" id="download-pdf">Baixar PDF</button>
        </div>
        <script>
          document.getElementById('download-pdf').addEventListener('click', () => {
            const docDefinition = {
              content: [
                { text: 'RELATÓRIO DE PRODUTOS\\n\\n', fontSize: 18, bold: true, alignment: 'center' },
                { text: 'Gerado por: ${userName}\\nSetor: ${userSector}\\nData: ${new Date().toLocaleDateString('pt-BR')}\\n\\n' },
                {
                  table: {
                    headerRows: 1,
                    widths: ['*', 'auto', 'auto', '*'],
                    body: [
                      ['Nome', 'Qtd', 'Validade', 'Código'],
                      ${products.map(p => `['${p.name.replace(/'/g, "\\'")}', '${p.quantity}', '${p.expiry}', '${p.barcode}']`).join(',')}
                    ]
                  }
                }
              ]
            };
            pdfMake.createPdf(docDefinition).download('relatorio.pdf');
          });
        </script>
      </body>
      </html>
    `);
    reportWindow.document.close();
  }

  // Inicializa a lista
  renderProducts();
});