let wallet = { codes: [], categories: [] };

(function init() {
  const params = new URLSearchParams(location.search);
  const data = params.get('data');
  if (data) {
    try { wallet = JSON.parse(decodeURIComponent(data)); } catch {}
  }
  renderList();

  document.getElementById('camera-input').addEventListener('change', e => decodeFromFile(e.target.files[0]));
  document.getElementById('gallery-input').addEventListener('change', e => decodeFromFile(e.target.files[0]));
  document.getElementById('code-data').addEventListener('input', updatePreview);
  document.getElementById('code-format').addEventListener('change', updatePreview);
})();

function renderList() {
  const el = document.getElementById('items-list');
  el.innerHTML = '';

  wallet.categories.forEach(cat => {
    const div = document.createElement('div');
    div.className = 'item folder';
    const span = document.createElement('span');
    span.textContent = '\u{1F4C1} ' + cat.name + ' (' + cat.codes.length + ')';
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.addEventListener('click', () => deleteCategory(cat.id));
    div.appendChild(span);
    div.appendChild(btn);
    el.appendChild(div);
  });

  wallet.codes.forEach(code => {
    const div = document.createElement('div');
    div.className = 'item';
    const span = document.createElement('span');
    span.textContent = code.name + ' ';
    const small = document.createElement('small');
    small.textContent = '(' + code.format + ')';
    span.appendChild(small);
    const btn = document.createElement('button');
    btn.textContent = 'Delete';
    btn.addEventListener('click', () => deleteCode(code.id, null));
    div.appendChild(span);
    div.appendChild(btn);
    el.appendChild(div);
  });
}

function showAddForm() {
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('add-form').style.display = 'block';
  refreshCategorySelect();
  document.getElementById('code-data').value = '';
  document.getElementById('code-name').value = '';
  document.getElementById('preview-error').textContent = '';
  const canvas = document.getElementById('preview-canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function cancelAdd() {
  document.getElementById('add-form').style.display = 'none';
  document.getElementById('list-view').style.display = 'block';
}

function refreshCategorySelect() {
  const sel = document.getElementById('code-category');
  sel.innerHTML = '<option value="">None (root level)</option>';
  wallet.categories.forEach(c => {
    const opt = document.createElement('option');
    opt.value = c.id;
    opt.textContent = c.name;
    sel.appendChild(opt);
  });
}

function addCategory() {
  const name = prompt('Category name:');
  if (!name) return;
  wallet.categories.push({ id: uid(), name, codes: [] });
  renderList();
}

function deleteCategory(id) {
  wallet.categories = wallet.categories.filter(c => c.id !== id);
  renderList();
}

function deleteCode(id, categoryId) {
  if (categoryId) {
    const cat = wallet.categories.find(c => c.id === categoryId);
    if (cat) cat.codes = cat.codes.filter(c => c.id !== id);
  } else {
    wallet.codes = wallet.codes.filter(c => c.id !== id);
  }
  renderList();
}

function confirmAdd() {
  const data   = document.getElementById('code-data').value.trim();
  const format = document.getElementById('code-format').value;
  const name   = document.getElementById('code-name').value.trim();
  const catId  = document.getElementById('code-category').value;

  if (!data) { alert('Enter code data.'); return; }
  if (!name) { alert('Enter a name.'); return; }

  const code = { id: uid(), name, data, format };
  if (catId) {
    const cat = wallet.categories.find(c => c.id === catId);
    if (cat) cat.codes.push(code);
  } else {
    wallet.codes.push(code);
  }
  cancelAdd();
  renderList();
}

function uid() {
  return Math.random().toString(36).slice(2, 10);
}

function triggerCamera() {
  document.getElementById('camera-input').click();
}

function triggerGallery() {
  document.getElementById('gallery-input').click();
}

function decodeFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = async () => {
      try {
        const codeReader = new ZXing.BrowserMultiFormatReader();
        const canvas = document.createElement('canvas');
        canvas.width = img.width;
        canvas.height = img.height;
        canvas.getContext('2d').drawImage(img, 0, 0);
        const result = await codeReader.decodeFromCanvas(canvas);
        document.getElementById('code-data').value = result.getText();
        document.getElementById('code-format').value = zxingFormatToOurs(result.getBarcodeFormat());
        document.getElementById('preview-error').textContent = '';
        updatePreview();
      } catch {
        document.getElementById('preview-error').textContent = 'No barcode found in image.';
      }
    };
    img.src = reader.result;
  };
  reader.readAsDataURL(file);
}

function zxingFormatToOurs(fmt) {
  const ZXingFormat = ZXing.BarcodeFormat;
  const map = {
    [ZXingFormat.QR_CODE]:  'QR',
    [ZXingFormat.AZTEC]:    'AZTEC',
    [ZXingFormat.CODE_128]: 'CODE128',
    [ZXingFormat.EAN_13]:   'EAN13',
    [ZXingFormat.PDF_417]:  'PDF417',
  };
  return map[fmt] || 'QR';
}

function updatePreview() {
  const data   = document.getElementById('code-data').value.trim();
  const format = document.getElementById('code-format').value;
  const canvas = document.getElementById('preview-canvas');
  const ctx    = canvas.getContext('2d');
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  if (!data) return;

  try {
    if (format === 'QR') {
      QRCode.toCanvas(canvas, data, { width: 160, errorCorrectionLevel: 'M' });
    } else if (format === 'EAN13' || format === 'CODE128') {
      JsBarcode(canvas, data, {
        format: format === 'EAN13' ? 'EAN13' : 'CODE128',
        width: 1.5,
        height: 80,
        displayValue: true,
        fontSize: 11
      });
    } else {
      ctx.fillStyle = '#aaa';
      ctx.font = '12px sans-serif';
      ctx.fillText(`${format} preview N/A`, 10, 80);
    }
    document.getElementById('preview-error').textContent = '';
  } catch (e) {
    document.getElementById('preview-error').textContent = e.message;
  }
}

function getReturnUrl() {
  const params = new URLSearchParams(location.search);
  return params.get('return_to') || 'pebblejs://close#';
}

function saveAndClose() {
  const json = JSON.stringify(wallet);
  if (json.length > 8192) {
    alert('Wallet too large (>8KB). Remove some codes before saving.');
    return;
  }
  document.location = getReturnUrl() + encodeURIComponent(json);
}
