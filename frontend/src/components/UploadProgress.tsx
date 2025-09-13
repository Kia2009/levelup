import React from 'react';

interface UploadProgressProps {
  progress: number;
  lang: 'en' | 'fa';
}

const UploadProgress: React.FC<UploadProgressProps> = ({ progress, lang }) => {
  if (progress === 0) return null;

  return (
    <div className="upload-progress-container">
      <div className="upload-progress-bar">
        <div 
          className="upload-progress-fill" 
          style={{ width: `${progress}%` }}
        />
      </div>
      <div className="upload-progress-text">
        {progress}% {lang === 'fa' ? 'آپلود شده' : 'uploaded'}
      </div>
    </div>
  );
};

export default UploadProgress;