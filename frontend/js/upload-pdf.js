// Upload PDF Module
(function() {
    'use strict';

    window.initUploadPDF = function() {
        console.log('📝 Initializing PDF Upload...');
        
        const uploadPDFHTML = `
            <div class="page-header">
                <h1><i class="fas fa-file-pdf"></i> Upload PDF Questions</h1>
                <button class="btn-secondary" onclick="viewUploadHistory()">
                    <i class="fas fa-history"></i> Upload History
                </button>
            </div>

            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 24px;">
                <!-- Upload Section -->
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="margin-bottom: 20px;"><i class="fas fa-cloud-upload-alt"></i> Upload New PDF</h2>
                    
                    <form id="pdfUploadForm" onsubmit="handlePDFUpload(event)">
                        <div class="form-group">
                            <label>Exam Type *</label>
                            <select id="pdfExamType" required>
                                <option value="">Select Exam Type</option>
                                <option value="IAT">IAT (IISER Aptitude Test)</option>
                                <option value="ISI">ISI (Indian Statistical Institute)</option>
                                <option value="NEST">NEST (National Entrance Screening Test)</option>
                            </select>
                        </div>
                        
                        <div class="form-group">
                            <label>Subject *</label>
                            <select id="pdfSubject" required>
                                <option value="">Select Subject</option>
                                <option value="Physics">Physics</option>
                                <option value="Mathematics">Mathematics</option>
                                <option value="Chemistry">Chemistry</option>
                                <option value="Biology">Biology</option>
                            </select>
                        </div>

                        <div class="form-group">
                            <label>Topic/Chapter</label>
                            <input type="text" id="pdfTopic" placeholder="e.g., Mechanics, Calculus">
                        </div>

                        <div class="form-group">
                            <label>Year</label>
                            <input type="number" id="pdfYear" placeholder="2024" min="2000" max="2025">
                        </div>

                        <div class="form-group">
                            <label>PDF File *</label>
                            <div id="dropZone" style="border: 2px dashed #cbd5e1; border-radius: 12px; padding: 40px; text-align: center; cursor: pointer; transition: all 0.3s;" 
                                 ondrop="handleDrop(event)" ondragover="handleDragOver(event)" ondragleave="handleDragLeave(event)" onclick="document.getElementById('pdfFile').click()">
                                <i class="fas fa-cloud-upload-alt" style="font-size: 48px; color: #94a3b8; margin-bottom: 16px;"></i>
                                <p style="color: #64748b; margin-bottom: 8px;">Drag & drop PDF here or click to browse</p>
                                <p style="color: #94a3b8; font-size: 12px;">Maximum file size: 10MB</p>
                                <input type="file" id="pdfFile" accept=".pdf" required style="display: none;" onchange="handleFileSelect(event)">
                            </div>
                            <div id="fileInfo" style="margin-top: 12px; display: none;"></div>
                        </div>

                        <div class="form-group">
                            <label style="display: flex; align-items: center; gap: 8px;">
                                <input type="checkbox" id="autoExtract">
                                <span>Auto-extract questions (AI powered)</span>
                            </label>
                        </div>

                        <div class="form-group">
                            <label>Notes/Description</label>
                            <textarea id="pdfNotes" rows="3" placeholder="Additional information about this PDF..."></textarea>
                        </div>

                        <button type="submit" class="btn-primary" style="width: 100%;">
                            <i class="fas fa-upload"></i> Upload PDF
                        </button>
                    </form>
                </div>

                <!-- Instructions Section -->
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <h2 style="margin-bottom: 20px;"><i class="fas fa-info-circle"></i> Upload Guidelines</h2>
                    
                    <div style="background: #eff6ff; border-left: 4px solid #3b82f6; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #1e40af; margin-bottom: 8px;">Supported Formats</h4>
                        <p style="color: #475569; margin: 0;">Only PDF files are accepted</p>
                    </div>

                    <div style="background: #f0fdf4; border-left: 4px solid #10b981; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #065f46; margin-bottom: 8px;">File Requirements</h4>
                        <ul style="color: #475569; margin: 8px 0; padding-left: 20px;">
                            <li>Maximum file size: 10MB</li>
                            <li>Clear and readable text</li>
                            <li>Properly formatted questions</li>
                            <li>Include answer key if available</li>
                        </ul>
                    </div>

                    <div style="background: #fefce8; border-left: 4px solid #f59e0b; padding: 16px; border-radius: 8px; margin-bottom: 20px;">
                        <h4 style="color: #92400e; margin-bottom: 8px;">Best Practices</h4>
                        <ul style="color: #475569; margin: 8px 0; padding-left: 20px;">
                            <li>Use descriptive filenames</li>
                            <li>Organize by subject and topic</li>
                            <li>Include year if from past papers</li>
                            <li>Add relevant tags and notes</li>
                        </ul>
                    </div>

                    <div style="background: #fef2f2; border-left: 4px solid #ef4444; padding: 16px; border-radius: 8px;">
                        <h4 style="color: #991b1b; margin-bottom: 8px;"><i class="fas fa-exclamation-triangle"></i> Important</h4>
                        <p style="color: #475569; margin: 0;">Ensure you have the right to upload and distribute the PDF content. Copyrighted material should not be uploaded without permission.</p>
                    </div>

                    <div id="uploadProgress" style="display: none; margin-top: 24px;">
                        <h4 style="margin-bottom: 12px;">Upload Progress</h4>
                        <div style="background: #f1f5f9; border-radius: 8px; height: 8px; overflow: hidden;">
                            <div id="progressBar" style="background: #3b82f6; height: 100%; width: 0%; transition: width 0.3s;"></div>
                        </div>
                        <p id="progressText" style="color: #64748b; font-size: 14px; margin-top: 8px;">0%</p>
                    </div>
                </div>
            </div>

            <!-- Upload History Section -->
            <div id="uploadHistorySection" style="display: none; margin-top: 24px;">
                <div style="background: white; padding: 24px; border-radius: 12px; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
                    <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 20px;">
                        <h2><i class="fas fa-history"></i> Upload History</h2>
                        <button onclick="hideUploadHistory()" class="btn-secondary">Close</button>
                    </div>
                    <div id="uploadHistoryContent"></div>
                </div>
            </div>

            <!-- Processing Modal -->
            <div id="processingModal" class="modal" style="display: none;">
                <div class="modal-content" style="max-width: 400px; text-align: center;">
                    <div style="padding: 40px;">
                        <i class="fas fa-spinner fa-spin" style="font-size: 48px; color: #3b82f6; margin-bottom: 20px;"></i>
                        <h3 style="margin-bottom: 12px;">Processing PDF</h3>
                        <p style="color: #64748b;">Please wait while we process your file...</p>
                    </div>
                </div>
            </div>
        `;

        document.getElementById('upload-pdf-page').innerHTML = uploadPDFHTML;
        loadUploadHistory();
    };

    let selectedFile = null;
    let uploadHistory = [];

    function loadUploadHistory() {
        const stored = localStorage.getItem('pdfUploadHistory');
        uploadHistory = stored ? JSON.parse(stored) : [];
    }

    function saveUploadHistory() {
        localStorage.setItem('pdfUploadHistory', JSON.stringify(uploadHistory));
    }

    window.handleDragOver = function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('dropZone').style.borderColor = '#3b82f6';
        document.getElementById('dropZone').style.background = '#eff6ff';
    };

    window.handleDragLeave = function(e) {
        e.preventDefault();
        e.stopPropagation();
        document.getElementById('dropZone').style.borderColor = '#cbd5e1';
        document.getElementById('dropZone').style.background = 'transparent';
    };

    window.handleDrop = function(e) {
        e.preventDefault();
        e.stopPropagation();
        
        const dropZone = document.getElementById('dropZone');
        dropZone.style.borderColor = '#cbd5e1';
        dropZone.style.background = 'transparent';
        
        const files = e.dataTransfer.files;
        if (files.length > 0) {
            const file = files[0];
            if (file.type === 'application/pdf') {
                selectedFile = file;
                displayFileInfo(file);
            } else {
                alert('Please upload a PDF file only.');
            }
        }
    };

    window.handleFileSelect = function(e) {
        const file = e.target.files[0];
        if (file) {
            if (file.size > 10 * 1024 * 1024) {
                alert('File size exceeds 10MB limit.');
                e.target.value = '';
                return;
            }
            selectedFile = file;
            displayFileInfo(file);
        }
    };

    function displayFileInfo(file) {
        const fileInfo = document.getElementById('fileInfo');
        const sizeInMB = (file.size / (1024 * 1024)).toFixed(2);
        
        fileInfo.style.display = 'block';
        fileInfo.innerHTML = `
            <div style="background: #f0fdf4; border: 1px solid #86efac; padding: 12px; border-radius: 8px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                    <i class="fas fa-file-pdf" style="color: #dc2626; margin-right: 8px;"></i>
                    <strong>${file.name}</strong>
                    <span style="color: #64748b; margin-left: 12px;">${sizeInMB} MB</span>
                </div>
                <button onclick="clearFile()" class="action-btn danger" type="button">
                    <i class="fas fa-times"></i>
                </button>
            </div>
        `;
    }

    window.clearFile = function() {
        selectedFile = null;
        document.getElementById('pdfFile').value = '';
        document.getElementById('fileInfo').style.display = 'none';
    };

    window.handlePDFUpload = function(e) {
        e.preventDefault();
        
        if (!selectedFile) {
            alert('Please select a PDF file.');
            return;
        }

        const uploadData = {
            id: Date.now(),
            fileName: selectedFile.name,
            fileSize: (selectedFile.size / (1024 * 1024)).toFixed(2),
            examType: document.getElementById('pdfExamType').value,
            subject: document.getElementById('pdfSubject').value,
            topic: document.getElementById('pdfTopic').value || 'N/A',
            year: document.getElementById('pdfYear').value || 'N/A',
            autoExtract: document.getElementById('autoExtract').checked,
            notes: document.getElementById('pdfNotes').value,
            uploadDate: new Date().toISOString(),
            status: 'completed'
        };

        // Show processing modal
        document.getElementById('processingModal').style.display = 'flex';

        // Simulate upload process
        simulateUpload(() => {
            uploadHistory.unshift(uploadData);
            saveUploadHistory();
            
            document.getElementById('processingModal').style.display = 'none';
            
            if (window.AdminUtils) {
                window.AdminUtils.showToast('PDF uploaded successfully!', 'success');
            } else {
                alert('PDF uploaded successfully!');
            }
            
            document.getElementById('pdfUploadForm').reset();
            clearFile();
        });
    };

    function simulateUpload(callback) {
        let progress = 0;
        const interval = setInterval(() => {
            progress += 10;
            document.getElementById('progressBar').style.width = progress + '%';
            document.getElementById('progressText').textContent = progress + '%';
            document.getElementById('uploadProgress').style.display = 'block';
            
            if (progress >= 100) {
                clearInterval(interval);
                setTimeout(() => {
                    document.getElementById('uploadProgress').style.display = 'none';
                    document.getElementById('progressBar').style.width = '0%';
                    callback();
                }, 500);
            }
        }, 200);
    }

    window.viewUploadHistory = function() {
        const section = document.getElementById('uploadHistorySection');
        section.style.display = 'block';
        renderUploadHistory();
    };

    window.hideUploadHistory = function() {
        document.getElementById('uploadHistorySection').style.display = 'none';
    };

    function renderUploadHistory() {
        const container = document.getElementById('uploadHistoryContent');
        
        if (uploadHistory.length === 0) {
            container.innerHTML = `
                <div style="text-align: center; padding: 40px; color: #94a3b8;">
                    <i class="fas fa-inbox" style="font-size: 48px; margin-bottom: 16px;"></i>
                    <p>No upload history yet</p>
                </div>
            `;
            return;
        }

        const html = `
            <table class="data-table">
                <thead>
                    <tr>
                        <th>File Name</th>
                        <th>Subject</th>
                        <th>Exam Type</th>
                        <th>Size</th>
                        <th>Upload Date</th>
                        <th>Status</th>
                        <th>Actions</th>
                    </tr>
                </thead>
                <tbody>
                    ${uploadHistory.map(upload => `
                        <tr>
                            <td><i class="fas fa-file-pdf" style="color: #dc2626; margin-right: 8px;"></i>${upload.fileName}</td>
                            <td>${upload.subject}</td>
                            <td><span class="badge badge-${upload.examType.toLowerCase()}">${upload.examType}</span></td>
                            <td>${upload.fileSize} MB</td>
                            <td>${new Date(upload.uploadDate).toLocaleDateString('en-IN')}</td>
                            <td><span class="status-active">Completed</span></td>
                            <td>
                                <button class="action-btn" title="View"><i class="fas fa-eye"></i></button>
                                <button class="action-btn danger" title="Delete" onclick="deleteUpload(${upload.id})"><i class="fas fa-trash"></i></button>
                            </td>
                        </tr>
                    `).join('')}
                </tbody>
            </table>
        `;
        
        container.innerHTML = html;
    }

    window.deleteUpload = function(uploadId) {
        if (!confirm('Delete this upload record?')) return;
        
        uploadHistory = uploadHistory.filter(u => u.id !== uploadId);
        saveUploadHistory();
        renderUploadHistory();
        
        if (window.AdminUtils) {
            window.AdminUtils.showToast('Upload record deleted!', 'success');
        }
    };

})();