let dessertsData = [];

document.addEventListener('DOMContentLoaded', () => {
  fetchDesserts();
  setupEventListeners();
});

// Fetch active desserts from server
async function fetchDesserts() {
  try {
    const response = await fetch('/api/desserts');
    if (!response.ok) throw new Error('Failed to fetch menu');
    
    dessertsData = await response.json();
    renderMenuGrid(dessertsData);
    populateDessertSelect(dessertsData);
  } catch (err) {
    console.error(err);
    document.getElementById('desserts-grid').innerHTML = 
      '<div class="loading-spinner">Failed to load desserts. Please refresh the page.</div>';
  }
}

// Render dessert cards in the grid
function renderMenuGrid(desserts) {
  const grid = document.getElementById('desserts-grid');
  grid.innerHTML = '';

  desserts.forEach(item => {
    const card = document.createElement('div');
    card.className = 'menu-card';
    
    // Check pricing labels
    let priceLabel = '';
    if (item.price_8x5 === null && item.price_9x9 === null) {
      priceLabel = '<span class="menu-card-price tbd">Pricing: TBD</span>';
    } else {
      const prices = [];
      if (item.price_8x5 !== null) prices.push(`8x5: $${item.price_8x5.toFixed(2)}`);
      if (item.price_9x9 !== null) prices.push(`9x9: $${item.price_9x9.toFixed(2)}`);
      else prices.push('9x9: TBD');
      
      priceLabel = `<span class="menu-card-price tbd" style="font-size: 13px;">${prices.join(' | ')}</span>`;
    }

    const toppingsBadge = item.has_toppings ? '<span class="menu-card-badge">Customizable</span>' : '';

    card.innerHTML = `
      <div class="menu-card-img-wrapper">
        <img class="menu-card-img" src="${item.image_url}" alt="${item.name}">
        ${toppingsBadge}
      </div>
      <div class="menu-card-content">
        <h3 class="menu-card-title">${item.name}</h3>
        <p class="menu-card-desc">${item.description}</p>
        <div class="menu-card-footer">
          <div class="menu-card-price-container">
            <div class="menu-card-price-label">Starting at</div>
            ${priceLabel}
          </div>
          <a href="#order" class="btn btn-primary" style="padding: 8px 16px; font-size: 14px; border-radius: 8px;" onclick="selectDessertForOrder('${item.id}')">Customize</a>
        </div>
      </div>
    `;
    grid.appendChild(card);
  });
}

// Populate the select dropdown inside the order form
function populateDessertSelect(desserts) {
  const select = document.getElementById('dessert-select');
  
  // Clear any existing except default placeholder
  select.innerHTML = '<option value="" disabled selected>Choose a dessert...</option>';
  
  desserts.forEach(item => {
    const option = document.createElement('option');
    option.value = item.id;
    option.textContent = item.name;
    select.appendChild(option);
  });
}

// Hook options up to DOM events
function setupEventListeners() {
  const select = document.getElementById('dessert-select');
  const form = document.getElementById('order-form');
  const sizeRadios = document.getElementsByName('size');
  const toppingsCheckboxes = document.querySelectorAll('input[name="toppings"]');

  // Change dessert selection
  select.addEventListener('change', (e) => {
    handleDessertChange(e.target.value);
    updateOrderSummary();
  });

  // Change size selection
  sizeRadios.forEach(radio => {
    radio.addEventListener('change', updateOrderSummary);
  });

  // Change toppings selection
  toppingsCheckboxes.forEach(cb => {
    cb.addEventListener('change', updateOrderSummary);
  });

  // Form submission
  form.addEventListener('submit', handleFormSubmit);
}

// Auto scroll and choose dessert when "Customize" is clicked on a menu card
function selectDessertForOrder(dessertId) {
  const select = document.getElementById('dessert-select');
  select.value = dessertId;
  handleDessertChange(dessertId);
  updateOrderSummary();
}

// Handle layout toggling (e.g. toppings list display) when dessert type changes
function handleDessertChange(dessertId) {
  const toppingsContainer = document.getElementById('toppings-container');
  const selectedDessert = dessertsData.find(d => d.id === dessertId);
  
  // TBD pricing helpers update
  const price8x5Desc = document.getElementById('price-8x5-desc');
  if (selectedDessert) {
    if (selectedDessert.id === 'lemon_bars') {
      price8x5Desc.textContent = 'Lemon Bars: $12.00';
    } else {
      price8x5Desc.textContent = 'Pricing: TBD';
    }
  }

  if (selectedDessert && selectedDessert.has_toppings) {
    toppingsContainer.classList.remove('hidden');
  } else {
    toppingsContainer.classList.add('hidden');
    // Clear checkmarks on hidden checkboxes
    const checkedBoxes = toppingsContainer.querySelectorAll('input[name="toppings"]:checked');
    checkedBoxes.forEach(cb => { cb.checked = false; });
  }
}

// Calculate cost and refresh the checkout details box dynamically
function updateOrderSummary() {
  const select = document.getElementById('dessert-select');
  const selectedDessert = dessertsData.find(d => d.id === select.value);
  const size = document.querySelector('input[name="size"]:checked')?.value;
  
  const summaryItemName = document.getElementById('summary-item-name');
  const summaryItemPrice = document.getElementById('summary-item-price');
  const summaryToppingsList = document.getElementById('summary-toppings-list');
  const summaryTotalPrice = document.getElementById('summary-total-price');

  if (!selectedDessert) {
    summaryItemName.textContent = 'Dessert: Select item';
    summaryItemPrice.textContent = 'TBD';
    summaryToppingsList.textContent = 'None';
    summaryTotalPrice.textContent = 'TBD';
    return;
  }

  // Get selected toppings
  const checkedToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked'))
    .map(cb => cb.value);

  // Update item details text
  summaryItemName.textContent = `${selectedDessert.name} (${size})`;

  // Calculate pricing
  let basePrice = size === '9x9' ? selectedDessert.price_9x9 : selectedDessert.price_8x5;
  let hasTBD = basePrice === null || checkedToppings.length > 0;

  // Render individual base price
  summaryItemPrice.textContent = basePrice === null ? 'TBD' : `$${basePrice.toFixed(2)}`;

  // Render toppings list
  if (checkedToppings.length > 0) {
    // Format capitalize names
    const formatted = checkedToppings.map(t => t.charAt(0).toUpperCase() + t.slice(1)).join(', ');
    summaryToppingsList.textContent = `${formatted} (+TBD)`;
  } else {
    summaryToppingsList.textContent = 'None';
  }

  // Set final total
  if (hasTBD) {
    summaryTotalPrice.textContent = 'TBD';
  } else {
    summaryTotalPrice.textContent = `$${basePrice.toFixed(2)}`;
  }
}

// POST order JSON to API
async function handleFormSubmit(e) {
  e.preventDefault();

  const submitBtn = document.getElementById('submit-order-btn');
  submitBtn.disabled = true;
  submitBtn.textContent = 'Placing Order...';

  const select = document.getElementById('dessert-select');
  const selectedDessert = dessertsData.find(d => d.id === select.value);
  const size = document.querySelector('input[name="size"]:checked').value;
  const pickupDelivery = document.getElementById('pickup-delivery').value;
  const notes = document.getElementById('order-notes').value;
  
  const customerName = document.getElementById('customer-name').value;
  const customerPhone = document.getElementById('customer-phone').value;
  const customerEmail = document.getElementById('customer-email').value;

  const checkedToppings = Array.from(document.querySelectorAll('input[name="toppings"]:checked'))
    .map(cb => cb.value);

  const orderData = {
    customer_name: customerName,
    customer_phone: customerPhone,
    customer_email: customerEmail,
    dessert_id: selectedDessert.id,
    size: size,
    toppings: checkedToppings,
    notes: notes,
    pickup_delivery: pickupDelivery
  };

  try {
    const response = await fetch('/api/orders', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify(orderData)
    });

    const result = await response.json();

    if (!response.ok) {
      throw new Error(result.error || 'Failed to place order');
    }

    // Show success modal
    document.getElementById('success-customer-name').textContent = customerName;
    document.getElementById('success-dessert-name').textContent = selectedDessert.name;
    document.getElementById('success-size').textContent = size === '8x5' ? '8" x 5" Baking Pan' : '9" x 9" Baking Pan';
    document.getElementById('success-fulfillment').textContent = pickupDelivery === 'pickup' ? 'Self Pickup' : 'Coordinate Delivery';
    document.getElementById('success-price').textContent = result.total_price === 'TBD' ? 'TBD (To be confirmed)' : `$${result.total_price.toFixed(2)}`;
    document.getElementById('success-phone').textContent = customerPhone;

    document.getElementById('success-modal').style.display = 'block';

    // Reset form
    document.getElementById('order-form').reset();
    handleDessertChange('');
    updateOrderSummary();

  } catch (err) {
    alert(`Error: ${err.message}`);
  } finally {
    submitBtn.disabled = false;
    submitBtn.textContent = 'Place Order';
  }
}

// Modal handling
function closeSuccessModal() {
  document.getElementById('success-modal').style.display = 'none';
}
