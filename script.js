document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("product-form");

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const name = document.getElementById("name").value.trim();
    const quantity = document.getElementById("quantity").value.trim();
    const expiry = document.getElementById("expiry").value;
    const barcode = document.getElementById("barcode").value.trim();

    const product = {
      name,
      quantity,
      expiry,
      barcode,
      id: Date.now()
    };

    let products = JSON.parse(localStorage.getItem("products")) || [];

    products.push(product);

    localStorage.setItem("products", JSON.stringify(products));

    form.reset();

    const messageDiv = document.getElementById("message");
    messageDiv.textContent = "Produto adicionado com sucesso!";
    messageDiv.style.display = "block";

    setTimeout(() => {
      messageDiv.style.display = "none";
    }, 1000);
  });
  setupBarcodeScanner();
});
document.getElementById('expiry').addEventListener('input', function(e) {
    // Remove tudo que não é dígito
    let value = e.target.value.replace(/\D/g, '');
    
    // Formatação automática: DD/MM/AAAA
    if (value.length > 2 && value.length <= 4) {
        value = value.substring(0, 2) + '/' + value.substring(2);
    } else if (value.length > 4) {
        value = value.substring(0, 2) + '/' + value.substring(2, 4) + '/' + value.substring(4, 8);
    }
    
    // Limita o comprimento (DD/MM/AAAA = 10 caracteres)
    if (value.length > 10) {
        value = value.substring(0, 10);
    }
    e.target.value = value;
});
