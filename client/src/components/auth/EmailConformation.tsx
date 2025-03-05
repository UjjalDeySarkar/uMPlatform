import React, { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import './EmailConformation.css';

const EmailConformation = () => {
    const [searchParams] = useSearchParams();
    const domain = searchParams.get('domain'); // e.g. "nxt"
    const id = searchParams.get('id'); // e.g. "3"
    const [loading, setLoading] = useState(true);
    const [responseMessage, setResponseMessage] = useState('');
    const [error, setError] = useState(String);

  useEffect(() => {

    if (!id) {
        setError('No activation id provided.');
        setLoading(false);
        return;
    }

    const activateUser = async () => {
      try {
        const response = await fetch('http://'+domain+'.localhost:8000/users/activate/'+id);
        const data = await response.json();

        if (data.detail) {
          setResponseMessage(data.detail);
        } else if (data.message) {
          setResponseMessage(data.message);
        } else {
          setResponseMessage('Unexpected response from server.');
        }
      } catch (err) {
        setError('Something went wrong. Please try again later.');
      } finally {
        setLoading(false);
      }
    };

    activateUser();
  }, []);

  const renderMessage = () => {
    if (responseMessage === 'No User matches the given query.') {
      return (
        <div className="alert alert-error">
          <h2>Activation Failed</h2>
          <p>No user found for activation. Please contact support.</p>
        </div>
      );
    }
    if (responseMessage === 'User is already active.') {
      return (
        <div className="alert alert-info">
          <h2>Account Already Active</h2>
          <p>Your account is already activated.</p>
        </div>
      );
    }
    if (responseMessage === 'User activated successfully.') {
      return (
        <div className="alert alert-success">
          <h2>Activation Successful</h2>
          <p>Your account has been activated successfully.</p>
        </div>
      );
    }
    return <p>{responseMessage}</p>;
  };

  return (
    <div className="confirmation-page">
      <div className="confirmation-container">
        {loading && <p className="loading">Loading...</p>}
        {!loading && error && (
          <div className="alert alert-error">
            <p>{error}</p>
          </div>
        )}
        {!loading && !error && renderMessage()}
      </div>
    </div>
  );
};

export default EmailConformation;
