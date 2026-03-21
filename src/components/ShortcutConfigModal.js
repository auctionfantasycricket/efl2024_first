import React, { useState, useEffect } from 'react';
import { Modal } from 'antd';
import './ShortcutConfigModal.css';

const ShortcutConfigModal = ({ open, onClose, teams, shortcuts, setShortcut, resetShortcuts }) => {
  const [listeningTeam, setListeningTeam] = useState(null);

  // Listen for key press when a row is in "listening" mode
  useEffect(() => {
    if (!listeningTeam) return;
    const onKeyDown = (e) => {
      e.preventDefault();
      e.stopPropagation();
      const key = e.key.toLowerCase();
      // Ignore modifier-only keys and Escape
      if (e.key === 'Escape') { setListeningTeam(null); return; }
      if (['shift', 'control', 'alt', 'meta', 'tab'].includes(key)) return;
      setShortcut(listeningTeam, key);
      setListeningTeam(null);
    };
    document.addEventListener('keydown', onKeyDown, true);
    return () => document.removeEventListener('keydown', onKeyDown, true);
  }, [listeningTeam, setShortcut]);

  const handleRowClick = (teamName) => {
    setListeningTeam(prev => prev === teamName ? null : teamName);
  };

  const handleReset = () => {
    resetShortcuts(teams);
    setListeningTeam(null);
  };

  const handleClose = () => {
    setListeningTeam(null);
    onClose();
  };

  return (
    <Modal
      open={open}
      onCancel={handleClose}
      footer={null}
      title="Keyboard Shortcuts"
      className="shortcut-modal"
      width={480}
    >
      {/* Fixed amount shortcuts info */}
      <div className="amount-shortcuts-section">
        <h4>Amount Controls (fixed)</h4>
        <div className="amount-shortcut-row">
          <span>Focus bid amount input</span>
          <span className="shortcut-key-badge">A</span>
        </div>
        <div className="amount-shortcut-row">
          <span>Increase bid amount</span>
          <span className="shortcut-key-badge">↑</span>
        </div>
        <div className="amount-shortcut-row">
          <span>Decrease bid amount</span>
          <span className="shortcut-key-badge">↓</span>
        </div>
        <div className="amount-shortcut-row">
          <span>Open this menu</span>
          <span className="shortcut-key-badge">?</span>
        </div>
        <div className="amount-shortcut-row">
          <span>Focus player search</span>
          <span className="shortcut-key-badge">S</span>
        </div>
        <div className="amount-shortcut-row">
          <span>Next / Search player</span>
          <span className="shortcut-key-badge">N</span>
        </div>
      </div>

      {/* Team shortcuts (configurable) */}
      <div className="shortcut-list">
        {teams.map((teamName) => {
          const key = shortcuts[teamName];
          const isListening = listeningTeam === teamName;
          return (
            <div
              key={teamName}
              className={`shortcut-row ${isListening ? 'listening' : ''}`}
              onClick={() => handleRowClick(teamName)}
            >
              <span className="shortcut-team-name">{teamName}</span>
              {isListening ? (
                <span className="listening-hint">press a key…</span>
              ) : (
                <span className={`shortcut-key-badge ${!key ? 'unset' : ''}`}>
                  {key || 'none'}
                </span>
              )}
            </div>
          );
        })}
      </div>

      <div className="shortcut-footer">
        <span className="shortcut-hint-text">Click a row, then press any key to assign</span>
        <button className="btn btn-outline-secondary btn-sm" onClick={handleReset}>
          Reset to defaults
        </button>
      </div>
    </Modal>
  );
};

export default ShortcutConfigModal;
