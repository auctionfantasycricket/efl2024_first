import React from 'react';
import { Modal, Table, Typography, Card, Tag, Empty } from 'antd';
import { decryptData } from '../components/Encryption';
import './WaiverHistory.css';

const { Text, Title } = Typography;

const WaiverHistory = ({ visible, onClose, historyData }) => {
  // If there's no history data, or it's empty, show a placeholder
  if (!historyData || historyData.length === 0) {
    return (
      <Modal
        title="Waiver History"
        open={visible}
        onCancel={onClose}
        footer={null}
        width="90%"
        style={{ top: 20 }}
        className="waiver-history-modal"
      >
        <Empty 
          description="No waiver history available" 
          image={Empty.PRESENTED_IMAGE_SIMPLE} 
          className="waiver-history-empty"
        />
      </Modal>
    );
  }

  // Function to decrypt and filter non-empty preferences and drops
  const processWaiverEntry = (entry) => {
    const inPreferences = entry.in.map(item => item ? decryptData(item) : '').filter(Boolean);
    const outDrops = entry.out.map(item => item ? decryptData(item) : '').filter(Boolean);
    
    return {
      preferences: inPreferences,
      drops: outDrops,
      lastUpdatedBy: entry.lastUpdatedBy,
      lastUpdatedTime: entry.lastUpdatedTime
    };
  };

  const renderPlayerList = (players) => {
    if (players.length === 0) return <Text className="no-selection">No selection</Text>;
    
    return (
      <div className="player-tag-list">
        {players.map((player, idx) => (
          <Tag key={idx} className="player-history-tag">
            {player}
          </Tag>
        ))}
      </div>
    );
  };

  return (
    <Modal
      title={
        <div className="waiver-history-header">
          <Title level={4}>Waiver History</Title>
          <Text type="secondary">Past waiver selections by your team</Text>
        </div>
      }
      open={visible}
      onCancel={onClose}
      footer={null}
      width="90%"
      style={{ top: 20 }}
      className="waiver-history-modal"
    >
      <div className="waiver-history-content">
        {historyData.map((entry, index) => {
          const processedEntry = processWaiverEntry(entry);
          
          return (
            <Card 
              key={index} 
              className="waiver-history-card"
              title={
                <div className="waiver-history-card-header">
                  <Text strong>{processedEntry.lastUpdatedTime}</Text>
                  <Text type="secondary">Updated by: {processedEntry.lastUpdatedBy}</Text>
                </div>
              }
            >
              <div className="waiver-history-details">
                <div className="waiver-history-section">
                  <Text className="waiver-history-section-title">Players to Pick:</Text>
                  {renderPlayerList(processedEntry.preferences)}
                </div>
                <div className="waiver-history-section">
                  <Text className="waiver-history-section-title">Players to Drop:</Text>
                  {renderPlayerList(processedEntry.drops)}
                </div>
              </div>
            </Card>
          );
        })}
      </div>
    </Modal>
  );
};

export default WaiverHistory;