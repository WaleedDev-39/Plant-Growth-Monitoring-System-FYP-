import React, { useCallback, useState, useRef } from 'react';

const ACCEPTED_TYPES = ['image/jpeg', 'image/jpg', 'image/png'];
const MAX_SIZE = 10 * 1024 * 1024; // 10MB

const ImageUpload = ({ onUpload, loading }) => {
  const [dragOver, setDragOver] = useState(false);
  const [preview, setPreview] = useState(null);
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const inputRef = useRef(null);

  const validateFile = (file) => {
    if (!ACCEPTED_TYPES.includes(file.type)) {
      return 'Only JPG and PNG images are accepted.';
    }
    if (file.size > MAX_SIZE) {
      return 'File size must not exceed 10MB.';
    }
    return null;
  };

  const processFile = (file) => {
    const err = validateFile(file);
    if (err) { setError(err); return; }
    setError('');
    setSelectedFile(file);
    const reader = new FileReader();
    reader.onload = (e) => setPreview(e.target.result);
    reader.readAsDataURL(file);
  };

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragOver(false);
    const file = e.dataTransfer.files[0];
    if (file) processFile(file);
  }, []);

  const handleFileInput = (e) => {
    const file = e.target.files[0];
    if (file) processFile(file);
  };

  const handleSubmit = () => {
    if (!selectedFile) return;
    const formData = new FormData();
    formData.append('image', selectedFile);
    onUpload(formData);
  };

  const handleClear = () => {
    setPreview(null);
    setSelectedFile(null);
    setError('');
    if (inputRef.current) inputRef.current.value = '';
  };

  return (
    <div className="upload-section">
      <div
        className={`drop-zone ${dragOver ? 'drag-over' : ''} ${preview ? 'has-preview' : ''}`}
        onDragOver={(e) => { e.preventDefault(); setDragOver(true); }}
        onDragLeave={() => setDragOver(false)}
        onDrop={handleDrop}
        onClick={() => !preview && inputRef.current?.click()}
      >
        {preview ? (
          <div className="preview-container">
            <img src={preview} alt="Preview" className="image-preview" />
            <div className="preview-overlay">
              <span className="preview-name">{selectedFile?.name}</span>
              <span className="preview-size">{(selectedFile?.size / 1024 / 1024).toFixed(2)} MB</span>
            </div>
          </div>
        ) : (
          <div className="drop-zone-content">
            <div className="upload-icon-wrap">
              <i className="fas fa-cloud-upload-alt upload-icon"></i>
            </div>
            <h3>Drag &amp; Drop your plant image here</h3>
            <p>or click to browse files</p>
            <span className="upload-hint">JPG, PNG • Max 10MB</span>
          </div>
        )}
      </div>

      <input
        ref={inputRef}
        type="file"
        accept="image/jpeg,image/jpg,image/png"
        onChange={handleFileInput}
        style={{ display: 'none' }}
        id="image-file-input"
      />

      {error && (
        <div className="upload-error">
          <i className="fas fa-exclamation-circle"></i> {error}
        </div>
      )}

      <div className="upload-actions">
        {preview && (
          <button className="btn btn-outline" onClick={handleClear} disabled={loading}>
            <i className="fas fa-times"></i> Clear
          </button>
        )}
        {!preview && (
          <button className="btn btn-outline" onClick={() => inputRef.current?.click()}>
            <i className="fas fa-folder-open"></i> Browse Files
          </button>
        )}
        <button
          className="btn btn-analyze"
          onClick={handleSubmit}
          disabled={!selectedFile || loading}
        >
          {loading ? (
            <><span className="spinner-sm"></span> Analyzing...</>
          ) : (
            <><i className="fas fa-microscope"></i> Analyze Plant</>
          )}
        </button>
      </div>
    </div>
  );
};

export default ImageUpload;
