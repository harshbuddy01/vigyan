// Upload Image for Questions - Fixed API_BASE_URL conflict
// Last Updated: 2025-12-28 21:26 IST

// Use global window.API_BASE_URL (no const declaration to avoid conflict)

let selectedQuestionId = null;
let uploadedImages = []; // Store uploaded images

function showToast(message, type = 'success') {
    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    toast.style.cssText = `position:fixed;top:20px;right:20px;background:${type === 'success' ? '#10b981' : '#ef4444'};color:white;padding:16px 24px;border-radius:8px;box-shadow:0 4px 12px rgba(0,0,0,0.15);z-index:10000;animation:slideIn 0.3s ease;`;
    toast.textContent = message;
    document.body.appendChild(toast);
    setTimeout(() => {
        toast.style.animation = 'slideOut 0.3s ease';
        setTimeout(() => toast.remove(), 300);
    }, 3000);
}

const PAGE_CONTENT = `
<div class="form-container">
    <div class="form-header">
        <h2><i class="fas fa-image"></i> Upload Question Images</h2>
        <p>Upload images and link them to specific questions</p>
    </div>

    <!-- Step 1: Select Question -->
    <div style="background:#f8fafc;padding:24px;border-radius:12px;margin-bottom:24px;">
        <h3 style="margin-bottom:16px;color:#1e293b;">
            <i class="fas fa-list-ol"></i> Step 1: Select Question
        </h3>
        <div style="display:flex;gap:12px;align-items:center;">
            <select id="questionSelector" class="form-select" style="flex:1;">
                <option value="">Select a question...</option>
            </select>
            <button onclick="loadQuestions()" class="btn-secondary" style="padding:10px 20px;">
                <i class="fas fa-sync"></i> Refresh
            </button>
        </div>
        <div id="selectedQuestionPreview" style="margin-top:16px;padding:16px;background:white;border-radius:8px;display:none;">
            <h4 style="color:#64748b;font-size:14px;margin-bottom:8px;">Selected Question:</h4>
            <p id="questionText" style="font-size:16px;color:#1e293b;"></p>
        </div>
    </div>

    <!-- Step 2: Upload Image -->
    <div style="background:#f8fafc;padding:24px;border-radius:12px;margin-bottom:24px;">
        <h3 style="margin-bottom:16px;color:#1e293b;">
            <i class="fas fa-upload"></i> Step 2: Upload Image
        </h3>
        
        <!-- Drag & Drop Area -->
        <div id="dropZone" style="border:2px dashed #cbd5e1;border-radius:12px;padding:40px;text-align:center;background:white;cursor:pointer;transition:all 0.3s;">
            <i class="fas fa-cloud-upload-alt" style="font-size:48px;color:#94a3b8;margin-bottom:16px;"></i>
            <p style="color:#64748b;font-size:16px;margin-bottom:8px;">Drag & drop image here or click to browse</p>
            <p style="color:#94a3b8;font-size:14px;">Supports: JPG, PNG, GIF (Max 5MB)</p>
            <input type="file" id="imageInput" accept="image/*" style="display:none;">
        </div>

        <!-- Image Preview -->
        <div id="imagePreviewContainer" style="display:none;margin-top:20px;">
            <h4 style="color:#64748b;font-size:14px;margin-bottom:12px;">Image Preview:</h4>
            <div style="position:relative;display:inline-block;">
                <img id="imagePreview" style="max-width:100%;max-height:300px;border-radius:8px;box-shadow:0 2px 8px rgba(0,0,0,0.1);">
                <button onclick="removeImage()" style="position:absolute;top:8px;right:8px;background:#ef4444;color:white;border:none;border-radius:50%;width:32px;height:32px;cursor:pointer;">
                    <i class="fas fa-times"></i>
                </button>
            </div>
            <div style="margin-top:12px;">
                <label class="form-label">Image Caption (optional)</label>
                <input type="text" id="imageCaption" class="form-input" placeholder="e.g., Figure 1: Force diagram">
            </div>
        </div>
    </div>

    <!-- Step 3: Link & Save -->
    <div style="background:#f8fafc;padding:24px;border-radius:12px;margin-bottom:24px;">
        <h3 style="margin-bottom:16px;color:#1e293b;">
            <i class="fas fa-link"></i> Step 3: Link & Save
        </h3>
        <div style="display:flex;gap:12px;">
            <button id="linkImageBtn" onclick="linkImageToQuestion()" class="btn-primary" style="flex:1;" disabled>
                <i class="fas fa-link"></i> Link Image to Question
            </button>
            <button onclick="clearForm()" class="btn-secondary">
                <i class="fas fa-redo"></i> Reset
            </button>
        </div>
    </div>

    <!-- Linked Images Table -->
    <div style="background:white;padding:24px;border-radius:12px;">
        <div style="display:flex;justify-content:space-between;align-items:center;margin-bottom:20px;">
            <h3 style="color:#1e293b;"><i class="fas fa-images"></i> Linked Images</h3>
            <button onclick="exportLinkedImages()" class="export-btn">
                <i class="fas fa-download"></i> Export List
            </button>
        </div>
        <table class="data-table">
            <thead>
                <tr>
                    <th>Question ID</th>
                    <th>Question Preview</th>
                    <th>Image</th>
                    <th>Caption</th>
                    <th>Uploaded</th>
                    <th>Actions</th>
                </tr>
            </thead>
            <tbody id="linkedImagesTable">
                <tr>
                    <td colspan="6" style="text-align:center;color:#94a3b8;padding:40px;">
                        No images linked yet. Upload an image and link it to a question.
                    </td>
                </tr>
            </tbody>
        </table>
    </div>
</div>
`;

// Initialize page
function initImageUploadPage() {
    // Ensure AdminAPI is available
    if (!window.AdminAPI) {
        console.error('AdminAPI service not found');
        showToast('AdminAPI service not found', 'error');
        return;
    }

    const container = document.getElementById('upload-image-page');
    if (container) {
        container.innerHTML = PAGE_CONTENT;
        setupEventListeners();
        loadQuestions();
        loadLinkedImages();
    }
}

function setupEventListeners() {
    const dropZone = document.getElementById('dropZone');
    const imageInput = document.getElementById('imageInput');
    const questionSelector = document.getElementById('questionSelector');

    // Click to upload
    dropZone?.addEventListener('click', () => imageInput?.click());

    // File input change
    imageInput?.addEventListener('change', (e) => handleFileSelect(e.target.files[0]));

    // Drag & drop
    dropZone?.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#6366f1';
        dropZone.style.background = '#f0f4ff';
    });

    dropZone?.addEventListener('dragleave', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'white';
    });

    dropZone?.addEventListener('drop', (e) => {
        e.preventDefault();
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'white';
        handleFileSelect(e.dataTransfer.files[0]);
    });

    // Question selector change
    questionSelector?.addEventListener('change', (e) => {
        selectedQuestionId = e.target.value;
        showQuestionPreview(selectedQuestionId);
        updateLinkButton();
    });
}

async function loadQuestions() {
    try {
        const data = await window.AdminAPI.getQuestions();

        const selector = document.getElementById('questionSelector');
        if (selector) {
            selector.innerHTML = '<option value="">Select a question...</option>';
            data.questions?.forEach(q => {
                const option = document.createElement('option');
                option.value = q.id;
                option.textContent = `#${q.id} - ${q.question.substring(0, 60)}...`;
                selector.appendChild(option);
            });
        }
        showToast('Questions loaded successfully');
    } catch (error) {
        console.error('Error loading questions:', error);
        showToast('Failed to load questions', 'error');
    }
}

function showQuestionPreview(questionId) {
    const preview = document.getElementById('selectedQuestionPreview');
    const questionText = document.getElementById('questionText');

    if (!questionId) {
        preview.style.display = 'none';
        return;
    }

    // Find question from selector
    const selector = document.getElementById('questionSelector');
    const selectedOption = selector?.options[selector.selectedIndex];

    if (selectedOption) {
        questionText.textContent = selectedOption.textContent;
        preview.style.display = 'block';
    }
}

function handleFileSelect(file) {
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith('image/')) {
        showToast('Please select an image file', 'error');
        return;
    }

    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        showToast('Image size must be less than 5MB', 'error');
        return;
    }

    // Preview image
    const reader = new FileReader();
    reader.onload = (e) => {
        const preview = document.getElementById('imagePreview');
        const container = document.getElementById('imagePreviewContainer');

        if (preview && container) {
            preview.src = e.target.result;
            container.style.display = 'block';
            preview.dataset.imageData = e.target.result; // Store base64
            updateLinkButton();
        }
    };
    reader.readAsDataURL(file);
}

function removeImage() {
    const container = document.getElementById('imagePreviewContainer');
    const preview = document.getElementById('imagePreview');
    const caption = document.getElementById('imageCaption');

    if (container) container.style.display = 'none';
    if (preview) preview.src = '';
    if (caption) caption.value = '';

    document.getElementById('imageInput').value = '';
    updateLinkButton();
}

function updateLinkButton() {
    const btn = document.getElementById('linkImageBtn');
    const preview = document.getElementById('imagePreview');

    if (btn) {
        const hasQuestion = selectedQuestionId !== null && selectedQuestionId !== '';
        const hasImage = preview?.src && preview.src !== '';
        btn.disabled = !(hasQuestion && hasImage);
    }
}

async function linkImageToQuestion() {
    const preview = document.getElementById('imagePreview');
    const caption = document.getElementById('imageCaption');

    if (!selectedQuestionId || !preview?.dataset.imageData) {
        showToast('Please select a question and upload an image', 'error');
        return;
    }

    const linkData = {
        questionId: selectedQuestionId,
        imageData: preview.dataset.imageData,
        caption: caption?.value || '',
        uploadedAt: new Date().toISOString()
    };

    try {
        // Save to backend using AdminAPI
        await window.AdminAPI.uploadQuestionImage(selectedQuestionId, linkData);

        uploadedImages.push(linkData);
        showToast('✅ Image linked successfully!');
        loadLinkedImages();
        clearForm();

    } catch (error) {
        console.error('Upload Error:', error);
        // Save locally if backend fails
        uploadedImages.push(linkData);
        localStorage.setItem('linkedImages', JSON.stringify(uploadedImages));
        showToast('✅ Image linked locally (backend unavailable)');
        loadLinkedImages();
        clearForm();
    }
}

function loadLinkedImages() {
    // Load from localStorage
    const stored = localStorage.getItem('linkedImages');
    if (stored) {
        uploadedImages = JSON.parse(stored);
    }

    const tbody = document.getElementById('linkedImagesTable');
    if (!tbody) return;

    if (uploadedImages.length === 0) {
        tbody.innerHTML = '<tr><td colspan="6" style="text-align:center;color:#94a3b8;padding:40px;">No images linked yet.</td></tr>';
        return;
    }

    tbody.innerHTML = uploadedImages.map((img, index) => `
        <tr>
            <td><span style="font-weight:600;color:#6366f1;">#${img.questionId}</span></td>
            <td style="max-width:300px;overflow:hidden;text-overflow:ellipsis;white-space:nowrap;">
                ${getQuestionText(img.questionId)}
            </td>
            <td>
                <img src="${img.imageData}" style="width:60px;height:60px;object-fit:cover;border-radius:6px;cursor:pointer;" 
                     onclick="viewImage('${img.imageData}')">
            </td>
            <td>${img.caption || '<span style="color:#94a3b8;">No caption</span>'}</td>
            <td>${new Date(img.uploadedAt).toLocaleDateString()}</td>
            <td>
                <button class="action-btn" onclick="viewImage('${img.imageData}')" title="View">
                    <i class="fas fa-eye"></i>
                </button>
                <button class="action-btn danger" onclick="deleteLinkedImage(${index})" title="Delete">
                    <i class="fas fa-trash"></i>
                </button>
            </td>
        </tr>
    `).join('');
}

function getQuestionText(questionId) {
    const selector = document.getElementById('questionSelector');
    if (!selector) return 'Question #' + questionId;

    for (let option of selector.options) {
        if (option.value == questionId) {
            return option.textContent.substring(0, 50) + '...';
        }
    }
    return 'Question #' + questionId;
}

function viewImage(imageData) {
    const modal = document.createElement('div');
    modal.style.cssText = 'position:fixed;top:0;left:0;right:0;bottom:0;background:rgba(0,0,0,0.8);display:flex;align-items:center;justify-content:center;z-index:10000;';
    modal.innerHTML = `
        <div style="position:relative;max-width:90%;max-height:90%;">
            <img src="${imageData}" style="max-width:100%;max-height:90vh;border-radius:8px;">
            <button onclick="this.closest('div').parentElement.remove()" 
                    style="position:absolute;top:16px;right:16px;background:white;border:none;border-radius:50%;width:40px;height:40px;cursor:pointer;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
                <i class="fas fa-times"></i>
            </button>
        </div>
    `;
    document.body.appendChild(modal);
    modal.addEventListener('click', (e) => {
        if (e.target === modal) modal.remove();
    });
}

function deleteLinkedImage(index) {
    if (!confirm('Delete this image link?')) return;

    uploadedImages.splice(index, 1);
    localStorage.setItem('linkedImages', JSON.stringify(uploadedImages));
    showToast('Image link deleted');
    loadLinkedImages();
}

function clearForm() {
    selectedQuestionId = null;
    document.getElementById('questionSelector').value = '';
    document.getElementById('selectedQuestionPreview').style.display = 'none';
    removeImage();
}

function exportLinkedImages() {
    const csv = 'Question ID,Question,Caption,Upload Date\n' +
        uploadedImages.map(img =>
            `${img.questionId},"${getQuestionText(img.questionId)}","${img.caption}",${new Date(img.uploadedAt).toLocaleDateString()}`
        ).join('\n');

    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `linked-images-${new Date().toISOString().split('T')[0]}.csv`;
    a.click();
}

// Auto-initialize when page loads
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initImageUploadPage);
} else {
    setTimeout(initImageUploadPage, 100);
}