// ---- EDIT ME ----
const WHATSAPP_NUMBER = '27820000000';   // country code, no + or spaces
const OPEN_HOUR = 9;                      // 09:00
const CLOSE_HOUR = 22;                    // 22:00
const LARGE_EXTRA = 8;                    // extra rand for a large size

// ---- Menu data: an array of objects. Add your own items here! ----
const menu = [
  { id: 1,  name: 'Township Stack',      category: 'Burgers', price: 69, sized: false, image: 'burger.svg',  desc: 'Beef patty, cheese, lettuce, tomato and our house sauce.' },
  { id: 2,  name: 'Double Flame Burger', category: 'Burgers', price: 89, sized: false, image: 'burger.svg',  desc: 'Two flame-grilled patties with smoky BBQ sauce.' },
  { id: 3,  name: 'Garden Veggie Burger',category: 'Burgers', price: 65, sized: false, image: 'burger.svg',  desc: 'Bean and mealie patty with fresh salad.' },
  { id: 4,  name: 'Crispy Chicken Burger',category: 'Chicken', price: 72, sized: false, image: 'chicken.svg', desc: 'Crumbed chicken breast with peri-peri mayo.' },
  { id: 5,  name: 'Spicy Wings (6)',     category: 'Chicken', price: 78, sized: false, image: 'chicken.svg', desc: 'Six wings tossed in hot sauce.' },
  { id: 6,  name: 'Chicken Strips (5)',  category: 'Chicken', price: 68, sized: false, image: 'chicken.svg', desc: 'Crispy strips with a dipping sauce.' },
  { id: 7,  name: 'Chips',               category: 'Sides',   price: 28, sized: true,  image: 'fries.svg',   desc: 'Hot, salted and crispy.' },
  { id: 8,  name: 'Onion Rings',         category: 'Sides',   price: 32, sized: true,  image: 'fries.svg',   desc: 'Golden battered rings.' },
  { id: 9,  name: 'Creamy Coleslaw',     category: 'Sides',   price: 20, sized: false, image: 'fries.svg',   desc: 'Fresh cabbage and carrot in light mayo.' },
  { id: 10, name: 'Cola',                category: 'Drinks',  price: 22, sized: true,  image: 'drink.svg',   desc: 'Ice-cold fizzy cola.' },
  { id: 11, name: 'Iced Tea',            category: 'Drinks',  price: 24, sized: true,  image: 'drink.svg',   desc: 'Peach iced tea over ice.' },
  { id: 12, name: 'Thick Milkshake',     category: 'Drinks',  price: 38, sized: true,  image: 'drink.svg',   desc: 'Vanilla, chocolate or strawberry.' }
];

// order looks like { "7-Large": { id: 7, size: "Large", qty: 2 } }
let order = {};
try { order = JSON.parse(localStorage.getItem('sh-order')) || {}; } catch (e) { order = {}; }

const money = n => 'R' + n;
const grid = document.getElementById('menuGrid');
const orderList = document.getElementById('orderList');

function save() { try { localStorage.setItem('sh-order', JSON.stringify(order)); } catch (e) {} }
function unitPrice(item, size) { return item.price + (size === 'Large' ? LARGE_EXTRA : 0); }

// ---- Open or closed badge (uses the visitor's clock) ----
function updateStatus() {
  const hour = new Date().getHours();
  const badge = document.getElementById('status');
  const isOpen = hour >= OPEN_HOUR && hour < CLOSE_HOUR;
  badge.className = 'status ' + (isOpen ? 'open' : 'closed');
  badge.textContent = isOpen
    ? 'Open now until ' + CLOSE_HOUR + ':00'
    : 'Closed now. We open at 0' + OPEN_HOUR + ':00';
}

// ---- Show the menu ----
function renderMenu(filter) {
  grid.innerHTML = '';
  menu.filter(m => filter === 'all' || m.category === filter).forEach(item => {
    const card = document.createElement('article');
    card.className = 'item';
    card.innerHTML =
      '<img src="images/' + item.image + '" alt="">' +
      '<div class="body"><h3>' + item.name + '</h3><p class="desc">' + item.desc + '</p>' +
      '<p class="price">' + money(item.price) + '</p>' +
      (item.sized ? '<select aria-label="Size for ' + item.name + '"><option>Regular</option><option>Large</option></select>' : '') +
      '<button class="add">Add to order</button></div>';
    const select = card.querySelector('select');
    card.querySelector('.add').addEventListener('click', () => addItem(item.id, select ? select.value : 'Regular'));
    grid.appendChild(card);
  });
}

// ---- Order actions ----
function addItem(id, size) {
  const key = id + '-' + size;
  if (!order[key]) order[key] = { id, size, qty: 0 };
  order[key].qty++;
  save(); renderOrder();
}
function changeQty(key, change) {
  order[key].qty += change;
  if (order[key].qty <= 0) delete order[key];
  save(); renderOrder();
}

function renderOrder() {
  orderList.innerHTML = '';
  let total = 0, count = 0, lines = [];

  Object.keys(order).forEach(key => {
    const line = order[key];
    const item = menu.find(m => m.id === line.id);
    if (!item) return;
    const cost = unitPrice(item, line.size) * line.qty;
    total += cost; count += line.qty;
    const label = item.sized ? item.name + ' (' + line.size + ')' : item.name;
    lines.push(line.qty + ' x ' + label);

    const li = document.createElement('li');
    li.innerHTML = '<span class="name">' + label + '</span>' +
      '<button aria-label="Fewer">-</button><span>' + line.qty + '</span><button aria-label="More">+</button>' +
      '<strong>' + money(cost) + '</strong>';
    const [minus, plus] = li.querySelectorAll('button');
    minus.addEventListener('click', () => changeQty(key, -1));
    plus.addEventListener('click', () => changeQty(key, 1));
    orderList.appendChild(li);
  });

  document.getElementById('orderEmpty').hidden = count > 0;
  document.getElementById('orderTotal').textContent = money(total);
  document.getElementById('sendOrder').style.display = count > 0 ? 'block' : 'none';
  document.getElementById('clearOrder').style.display = count > 0 ? 'block' : 'none';
  updateLink(lines, total);
}

function updateLink(lines, total) {
  const name = document.getElementById('customer').value.trim() || 'a customer';
  const message = 'Hi Stack House, my name is ' + name + '. I would like to order:\n' +
    lines.join('\n') + '\nTotal: ' + money(total);
  document.getElementById('sendOrder').href = 'https://wa.me/' + WHATSAPP_NUMBER + '?text=' + encodeURIComponent(message);
}

// ---- Events ----
const filterButtons = document.querySelectorAll('.filter');
filterButtons.forEach(btn => btn.addEventListener('click', () => {
  filterButtons.forEach(b => b.classList.toggle('active', b === btn));
  renderMenu(btn.dataset.filter);
}));
document.getElementById('customer').addEventListener('input', renderOrder);
document.getElementById('clearOrder').addEventListener('click', () => { order = {}; save(); renderOrder(); });

document.getElementById('year').textContent = new Date().getFullYear();
updateStatus();
renderMenu('all');
renderOrder();
