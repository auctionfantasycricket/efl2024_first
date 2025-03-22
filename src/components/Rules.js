import React from 'react';
import Accordion from 'react-bootstrap/Accordion';
import './Rules.css'

export const Rules = () => {
  return (
    <section className='rulespage' id='rules'>
      <h1>Rules</h1>
      <Accordion>
        <Accordion.Item eventKey="0">
          <Accordion.Header>Draft Rules</Accordion.Header>
          <Accordion.Body>
            <div className="rule-content">
              <p>League will run till playoffs (no playoffs included)</p>
              <p>Total Squad Size: 8</p>
              
              <h4>Restrictions:</h4>
              <ul>
                <li>Batsmen min 2</li>
                <li>Bowlers min 2</li>
                <li>Allrounders min 2</li>
                <li>Foreign players - min 1 max 3</li>
              </ul>

              <p><strong>Draft:</strong> 30 seconds to pick a player</p>
            </div>
          </Accordion.Body>
        </Accordion.Item>
        <Accordion.Item eventKey="1">
          <Accordion.Header>Auction Rules</Accordion.Header>
          <Accordion.Body>
            <div className="rule-content">
              <p>Total Squad Size: 15. Budget per team - 70Cr</p>
              
              <h4>Restrictions:</h4>
              <ul>
                <li>Min 4 batsmen</li>
                <li>Min 4 bowlers</li>
                <li>Min 2 All rounders</li>
                <li>Min 4 - max 6 overseas players</li>
                <li>(No tier minimum/maximum requirements)</li>
              </ul>

              <h4>Player Tiers</h4>
              <ul>
                <li>Tier 1 - Base Price 2cr</li>
                <li>Tier 2 - Base Price 1 cr</li>
                <li>Tier 3 - Base Price 50 lakhs</li>
                <li>Tier 4 - Base Price 20 lakhs</li>
              </ul>

              <h4>AUCTION</h4>
              <p><strong>Sequence of players to bid in auction:</strong></p>
              <p>Tier 1 and Tier 2 will be random through the list like last time.</p>
              <p>Tier 1, have a random generator and call out players accordingly.</p>
              <p>Then move to Tier 2 and the same random process.</p>
              <p>Tier 3 and Tier 4, teams call out the name in round table basis as per the below list:</p>
              <ul>
                <li>(you can also choose unsold player from tier 1 and 2)</li>
                <li>(ORDER TBD by random list generator)</li>
              </ul>
              
              <p><strong>Bid increment rules:</strong></p>
              <ul>
                <li>10 lakhs increment upto 1 cr</li>
                <li>20 lakh increments upto 5 Cr</li>
                <li>50 lakh increments after 5 Cr</li>
              </ul>
            </div>
          </Accordion.Body>
        </Accordion.Item>
      </Accordion>
    </section>
  );
}