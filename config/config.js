let wallet = { codes: [], categories: [] };
let editState = null; // null = add mode; { code, categoryId } = edit mode

(function init() {
  const params = new URLSearchParams(location.search);
  const data = params.get('data');
  if (data) {
    try { wallet = JSON.parse(decodeURIComponent(data)); } catch {}
  }
  renderList();

  document.getElementById('gallery-input').addEventListener('change', e => decodeFromFile(e.target.files[0]));
  document.getElementById('code-data').addEventListener('input', updatePreview);
  document.getElementById('code-format').addEventListener('change', updatePreview);
})();

function renderList() {
  const el = document.getElementById('items-list');
  el.innerHTML = '';

  wallet.categories.forEach(cat => {
    const folderDiv = document.createElement('div');
    folderDiv.className = 'item folder';
    const span = document.createElement('span');
    span.textContent = '\u{1F4C1} ' + cat.name;
    const delBtn = document.createElement('button');
    delBtn.textContent = 'Delete';
    delBtn.addEventListener('click', () => deleteCategory(cat.id));
    folderDiv.appendChild(span);
    folderDiv.appendChild(delBtn);
    el.appendChild(folderDiv);

    cat.codes.forEach(code => {
      el.appendChild(makeCodeRow(code, cat.id));
    });
  });

  wallet.codes.forEach(code => {
    el.appendChild(makeCodeRow(code, null));
  });
}

function makeCodeRow(code, categoryId) {
  const div = document.createElement('div');
  div.className = 'item';
  div.style.paddingLeft = categoryId ? '16px' : '0';

  const span = document.createElement('span');
  span.textContent = code.name + ' ';
  const small = document.createElement('small');
  small.textContent = '(' + code.format + ')';
  span.appendChild(small);

  const editBtn = document.createElement('button');
  editBtn.textContent = 'Edit';
  editBtn.style.marginRight = '4px';
  editBtn.addEventListener('click', () => showEditForm(code, categoryId));

  const delBtn = document.createElement('button');
  delBtn.textContent = 'Delete';
  delBtn.addEventListener('click', () => deleteCode(code.id, categoryId));

  div.appendChild(span);
  div.appendChild(editBtn);
  div.appendChild(delBtn);
  return div;
}

function showAddForm() {
  editState = null;
  document.getElementById('form-title').textContent = 'Add Code';
  document.getElementById('save-btn').textContent = 'Add';
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('add-form').style.display = 'block';
  refreshCategorySelect();
  document.getElementById('code-data').value = '';
  document.getElementById('code-name').value = '';
  document.getElementById('code-format').value = 'QR';
  document.getElementById('code-category').value = '';
  document.getElementById('preview-error').textContent = '';
  const canvas = document.getElementById('preview-canvas');
  canvas.getContext('2d').clearRect(0, 0, canvas.width, canvas.height);
}

function showEditForm(code, categoryId) {
  editState = { code, categoryId };
  document.getElementById('form-title').textContent = 'Edit Code';
  document.getElementById('save-btn').textContent = 'Save';
  document.getElementById('list-view').style.display = 'none';
  document.getElementById('add-form').style.display = 'block';
  refreshCategorySelect();
  document.getElementById('code-data').value = code.data;
  document.getElementById('code-name').value = code.name;
  document.getElementById('code-format').value = code.format;
  document.getElementById('code-category').value = categoryId || '';
  document.getElementById('preview-error').textContent = '';
  updatePreview();
}

function cancelAdd() {
  document.getElementById('add-form').style.display = 'none';
  document.getElementById('list-view').style.display = 'block';
  editState = null;
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

function showAddCategoryForm() {
  document.getElementById('add-category-form').style.display = 'block';
  document.getElementById('category-name').value = '';
  document.getElementById('category-name').focus();
}

function cancelAddCategory() {
  document.getElementById('add-category-form').style.display = 'none';
}

function confirmAddCategory() {
  const name = document.getElementById('category-name').value.trim();
  if (!name) return;
  wallet.categories.push({ id: uid(), name, codes: [] });
  cancelAddCategory();
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

function confirmSave() {
  const data   = document.getElementById('code-data').value.trim();
  const format = document.getElementById('code-format').value;
  const name   = document.getElementById('code-name').value.trim();
  const catId  = document.getElementById('code-category').value;

  if (!data) { alert('Enter code data.'); return; }
  if (!name) { alert('Enter a name.'); return; }

  if (editState) {
    // remove from old location
    deleteCode(editState.code.id, editState.categoryId);
  }

  const code = { id: editState ? editState.code.id : uid(), name, data, format };
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

function triggerGallery() {
  document.getElementById('gallery-input').click();
}

function decodeFromFile(file) {
  if (!file) return;
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.onload = async () => {
      const MAX = 1024;
      let src = img;
      if (img.width > MAX || img.height > MAX) {
        const scale = MAX / Math.max(img.width, img.height);
        const canvas = document.createElement('canvas');
        canvas.width  = Math.round(img.width  * scale);
        canvas.height = Math.round(img.height * scale);
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height);
        const scaled = new Image();
        scaled.src = canvas.toDataURL();
        await new Promise(r => { scaled.onload = r; });
        src = scaled;
      }

      try {
        const hints = new Map();
        hints.set(ZXing.DecodeHintType.TRY_HARDER, true);
        const codeReader = new ZXing.BrowserMultiFormatReader(hints);
        const result = await codeReader.decodeFromImageElement(src);
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
