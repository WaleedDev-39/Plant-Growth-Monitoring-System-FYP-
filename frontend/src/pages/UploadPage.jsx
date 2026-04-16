import React, { useState, useEffect } from 'react';
import Header from '../components/Header';
import ImageUpload from '../components/ImageUpload';
import AnalysisResultCard from '../components/AnalysisResultCard';
import ComparisonView from '../components/ComparisonView';
import { uploadImage, getHistory } from '../api/upload';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const UploadPage = () => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [latestResult, setLatestResult] = useState(null);
  const [previousResult, setPreviousResult] = useState(null);
  const [latestHistory, setLatestHistory] = useState(null);

  // Fetch the most recent previous result for comparison
  useEffect(() => {
    const fetchLatest = async () => {
      try {
        const res = await getHistory(user._id);
        if (res.data.data && res.data.data.length > 0) {
          setPreviousResult(res.data.data[0]);
        }
      } catch (e) { /* silent */ }
    };
    if (user) fetchLatest();
  }, [user]);

  const handleUpload = async (formData) => {
    setLoading(true);
    const toastId = toast.loading('Analyzing plant image...');
    try {
      const res = await uploadImage(formData);
      const { history, analysisResults, alerts } = res.data.data;

      setLatestResult(analysisResults);
      setLatestHistory(history);

      if (alerts && alerts.length > 0) {
        toast.error(`⚠️ ${alerts.length} alert(s) generated — check Alerts page`, { id: toastId, duration: 5000 });
      } else {
        toast.success('Analysis complete! ✅', { id: toastId });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Upload failed. Please try again.';
      toast.error(msg, { id: toastId });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div>
      <Header title="Analyze Plant" />
      <div className="page-content">
        <div className="upload-page-grid">
          {/* Left: Upload panel */}
          <div className="upload-panel">
            <div className="panel-card">
              <div className="panel-header">
                <i className="fas fa-cloud-upload-alt"></i>
                <h3>Upload Plant Image</h3>
              </div>
              <p className="panel-subtitle">
                Upload a clear photo of your plant to get AI-powered health analysis including disease detection, nutrient deficiency assessment, and growth stage classification.
              </p>
              <ImageUpload onUpload={handleUpload} loading={loading} />
            </div>
          </div>

          {/* Right: Results panel */}
          <div className="results-panel">
            {latestResult ? (
              <>
                <AnalysisResultCard
                  result={latestResult}
                  imageName={latestHistory?.originalImageName}
                  imageUrl={latestHistory?.imageUrl}
                />
                {previousResult && (
                  <ComparisonView
                    current={latestHistory}
                    previous={previousResult}
                  />
                )}
              </>
            ) : (
              <div className="results-placeholder">
                <div className="placeholder-icon">
                  <i className="fas fa-microscope"></i>
                </div>
                <h3>Analysis Results</h3>
                <p>Upload a plant photo to see detailed AI analysis results here, including growth stage, detected diseases, nutrient deficiencies, and personalized care recommendations.</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default UploadPage;
