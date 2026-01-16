import { useState, useEffect } from 'react'
import { useStats, usePlayer, useTimer, useMatchHistory, usePlayingTime } from './hooks/useStats'
import StatCounter from './components/StatCounter'
import Timer from './components/Timer'
import PlayerInfo from './components/PlayerInfo'
import StatsDisplay from './components/StatsDisplay'
import MatchHistory from './components/MatchHistory'
import CourtMap from './components/CourtMap'
import PinLock from './components/PinLock'

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  body {
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    min-height: 100vh;
    color: #fff;
    padding: 20px;
  }

  .container {
    max-width: 900px;
    margin: 0 auto;
  }

  h1 {
    text-align: center;
    margin-bottom: 20px;
    color: #ff6b35;
    font-size: 2rem;
  }

  .badge {
    background: #61dafb;
    color: #000;
    padding: 2px 8px;
    border-radius: 4px;
    font-size: 0.7rem;
    margin-left: 10px;
    vertical-align: middle;
  }

  /* Navigation Tabs */
  .nav-tabs {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
    justify-content: center;
  }

  .nav-tab {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid transparent;
    color: rgba(255, 255, 255, 0.7);
    padding: 12px 30px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .nav-tab:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .nav-tab.active {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .player-info {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    display: flex;
    gap: 20px;
    flex-wrap: wrap;
    align-items: center;
  }

  .player-info input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    color: #fff;
    font-size: 1rem;
    flex: 1;
    min-width: 200px;
  }

  .player-info input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .player-info input:focus {
    outline: none;
    border-color: #61dafb;
  }

  .timer-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
    text-align: center;
    position: relative;
    overflow: hidden;
  }

  .timer-header {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .settings-btn {
    background: linear-gradient(135deg, rgba(255, 255, 255, 0.1) 0%, rgba(255, 255, 255, 0.05) 100%);
    border: 2px solid rgba(255, 255, 255, 0.2);
    border-radius: 50%;
    width: 42px;
    height: 42px;
    display: flex;
    align-items: center;
    justify-content: center;
    cursor: pointer;
    transition: all 0.3s ease;
    color: rgba(255, 255, 255, 0.7);
  }

  .settings-btn svg {
    transition: transform 0.4s ease;
  }

  .settings-btn:hover {
    background: linear-gradient(135deg, rgba(97, 218, 251, 0.3) 0%, rgba(97, 218, 251, 0.1) 100%);
    border-color: #61dafb;
    color: #61dafb;
    transform: scale(1.1);
  }

  .settings-btn:hover svg {
    transform: rotate(90deg);
  }

  .settings-btn.active {
    background: linear-gradient(135deg, #61dafb 0%, #4fa8c7 100%);
    border-color: #61dafb;
    color: #000;
    box-shadow: 0 0 20px rgba(97, 218, 251, 0.4);
  }

  .settings-btn.active svg {
    transform: rotate(180deg);
  }

  .duration-selector {
    background: rgba(0, 0, 0, 0.3);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    animation: slideDown 0.2s ease;
  }

  @keyframes slideDown {
    from { opacity: 0; transform: translateY(-10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .duration-selector p {
    margin-bottom: 12px;
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
  }

  .duration-options {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .duration-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 10px 18px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .duration-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
  }

  .duration-btn.active {
    background: #61dafb;
    border-color: #61dafb;
    color: #000;
    font-weight: bold;
  }

  .timer-display-wrapper {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    margin-bottom: 15px;
  }

  .timer-display {
    font-size: 3rem;
    font-weight: bold;
    font-family: 'Courier New', monospace;
  }

  .time-adjust-group {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .time-adjust-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .time-adjust-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .time-adjust-btn:active {
    transform: scale(0.95);
  }

  .quarter-display {
    font-size: 1.2rem;
    color: #61dafb;
  }

  .timer-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .timer-btn {
    background: #61dafb;
    border: none;
    color: #000;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    font-weight: 500;
  }

  .timer-btn:hover {
    background: #7ce3ff;
    transform: translateY(-2px);
  }

  .timer-btn.primary {
    background: linear-gradient(135deg, #61dafb 0%, #4fa8c7 100%);
    padding: 12px 25px;
    font-weight: bold;
  }

  .timer-btn.primary:hover {
    background: linear-gradient(135deg, #7ce3ff 0%, #61dafb 100%);
  }

  .timer-btn.secondary {
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
  }

  .timer-btn.secondary:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .timer-btn.quarter-nav {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .timer-btn.quarter-nav:hover:not(.disabled) {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .timer-btn.disabled {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .timer-btn.disabled:hover {
    transform: none;
  }

  .timer-btn.end-match {
    background: linear-gradient(135deg, #e74c3c 0%, #c0392b 100%);
    color: #fff;
    font-weight: bold;
  }

  .timer-btn.end-match:hover {
    background: linear-gradient(135deg, #ff6b5b 0%, #e74c3c 100%);
  }

  /* Confirmation Modal */
  .confirm-overlay {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    border-radius: 12px;
    z-index: 10;
    animation: fadeIn 0.2s ease;
  }

  .confirm-modal {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
    border: 2px solid #61dafb;
    border-radius: 16px;
    padding: 25px 35px;
    text-align: center;
    animation: scaleIn 0.2s ease;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .confirm-icon {
    font-size: 2.5rem;
    margin-bottom: 15px;
    color: #61dafb;
  }

  .confirm-modal p {
    font-size: 1.1rem;
    margin-bottom: 8px;
  }

  .confirm-warning {
    font-size: 0.9rem !important;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 20px !important;
  }

  .confirm-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .confirm-btn {
    padding: 10px 20px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
    font-weight: 500;
  }

  .confirm-btn.yes {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: #fff;
  }

  .confirm-btn.yes:hover {
    background: linear-gradient(135deg, #3ddb80 0%, #2ecc71 100%);
    transform: translateY(-2px);
  }

  .confirm-btn.no {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .confirm-btn.no:hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(280px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .stat-card {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px;
  }

  .stat-card h3 {
    color: #61dafb;
    margin-bottom: 15px;
    font-size: 1rem;
    text-transform: uppercase;
    letter-spacing: 1px;
  }

  .stat-row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    margin-bottom: 10px;
    padding: 8px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .stat-row:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .stat-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.8);
  }

  .stat-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .stat-btn {
    width: 32px;
    height: 32px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    transition: all 0.2s;
  }

  .stat-btn.minus {
    background: #e74c3c;
    color: #fff;
  }

  .stat-btn.minus:hover {
    background: #c0392b;
  }

  .stat-btn.plus {
    background: #2ecc71;
    color: #fff;
  }

  .stat-btn.plus:hover {
    background: #27ae60;
  }

  .stat-value {
    font-size: 1.2rem;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
  }

  .summary {
    background: rgba(97, 218, 251, 0.2);
    border: 1px solid #61dafb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .summary h3 {
    color: #61dafb;
    margin-bottom: 15px;
    text-align: center;
  }

  .summary-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
    gap: 15px;
    text-align: center;
  }

  .summary-item {
    background: rgba(255, 255, 255, 0.1);
    padding: 15px;
    border-radius: 8px;
  }

  .summary-value {
    font-size: 2rem;
    font-weight: bold;
    color: #61dafb;
  }

  .summary-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
    margin-top: 5px;
  }

  .actions {
    display: flex;
    gap: 10px;
    justify-content: center;
    flex-wrap: wrap;
  }

  .action-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 12px 24px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #61dafb;
  }

  .action-btn.primary {
    background: #61dafb;
    border-color: #61dafb;
    color: #000;
  }

  .action-btn.primary:hover {
    background: #7ce3ff;
  }

  .action-btn.danger {
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .action-btn.danger:hover {
    background: rgba(231, 76, 60, 0.2);
  }

  /* Save Match Section */
  .save-match-section {
    background: rgba(46, 204, 113, 0.2);
    border: 1px solid #2ecc71;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .save-match-section h3 {
    color: #2ecc71;
    margin-bottom: 15px;
    text-align: center;
  }

  .save-match-form {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
    justify-content: center;
    align-items: center;
  }

  .save-match-form input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    color: #fff;
    font-size: 1rem;
    min-width: 200px;
  }

  .save-match-form input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .save-match-form input:focus {
    outline: none;
    border-color: #2ecc71;
  }

  .save-btn {
    background: #2ecc71;
    border: none;
    color: #fff;
    padding: 12px 30px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: bold;
    transition: all 0.2s;
  }

  .save-btn:hover {
    background: #27ae60;
    transform: translateY(-2px);
  }

  /* History Page Styles */
  .history-page {
    animation: fadeIn 0.3s ease;
  }

  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(400px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  .chart-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
  }

  .chart-container h3 {
    color: #61dafb;
    margin-bottom: 15px;
    text-align: center;
  }

  .chart-empty {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
  }

  .radar-legend {
    display: flex;
    flex-wrap: wrap;
    justify-content: center;
    gap: 15px;
    margin-top: 15px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .averages-section {
    background: rgba(97, 218, 251, 0.2);
    border: 1px solid #61dafb;
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .averages-section h3 {
    color: #61dafb;
    text-align: center;
    margin-bottom: 15px;
  }

  .averages-grid {
    display: flex;
    justify-content: center;
    gap: 20px;
    flex-wrap: wrap;
  }

  .avg-item {
    text-align: center;
    background: rgba(255, 255, 255, 0.1);
    padding: 15px 25px;
    border-radius: 8px;
  }

  .avg-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #61dafb;
    display: block;
  }

  .avg-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .match-list {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
  }

  .match-list-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .match-list-header h3 {
    color: #61dafb;
  }

  .clear-btn {
    background: transparent;
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .clear-btn:hover {
    background: rgba(231, 76, 60, 0.2);
  }

  .no-matches {
    text-align: center;
    padding: 30px;
    color: rgba(255, 255, 255, 0.6);
  }

  .no-matches p {
    margin-bottom: 10px;
  }

  .matches {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .match-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    transition: all 0.2s;
  }

  .match-card:hover {
    background: rgba(255, 255, 255, 0.1);
  }

  .match-header {
    display: flex;
    align-items: center;
    gap: 15px;
    margin-bottom: 10px;
  }

  .match-date {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .match-opponent {
    color: #61dafb;
    font-weight: bold;
  }

  .delete-btn {
    margin-left: auto;
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-size: 1.5rem;
    cursor: pointer;
    padding: 0 5px;
    line-height: 1;
    transition: color 0.2s;
  }

  .delete-btn:hover {
    color: #e74c3c;
  }

  .match-stats {
    display: flex;
    gap: 15px;
    flex-wrap: wrap;
  }

  .match-stat {
    text-align: center;
    min-width: 50px;
  }

  .match-stat .stat-val {
    font-size: 1.3rem;
    font-weight: bold;
    display: block;
  }

  .match-stat .stat-name {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .match-stat.highlight .stat-val {
    color: #ff6b35;
    font-size: 1.5rem;
  }

  .match-card.selected {
    border: 2px solid #61dafb;
    background: rgba(97, 218, 251, 0.15);
  }

  .match-card {
    cursor: pointer;
    border: 2px solid transparent;
  }

  /* History Filter */
  .history-filter {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px 20px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .history-filter label {
    color: rgba(255, 255, 255, 0.8);
    font-weight: 500;
  }

  .match-select {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    color: #fff;
    font-size: 1rem;
    cursor: pointer;
  }

  .match-select:focus {
    outline: none;
    border-color: #61dafb;
  }

  .match-select option {
    background: #1a1a2e;
    color: #fff;
  }

  /* Detailed Stats Section */
  .detailed-stats-section {
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .detailed-stats-section h3 {
    color: #61dafb;
    margin-bottom: 20px;
    text-align: center;
  }

  .detailed-stats-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(80px, 1fr));
    gap: 15px;
    margin-bottom: 20px;
  }

  .detailed-stat {
    text-align: center;
    background: rgba(255, 255, 255, 0.05);
    padding: 15px 10px;
    border-radius: 10px;
  }

  .detailed-stat.big {
    grid-column: span 2;
    background: rgba(255, 107, 53, 0.2);
    border: 1px solid rgba(255, 107, 53, 0.4);
  }

  .detailed-stat.big .ds-value {
    font-size: 2.5rem;
    color: #ff6b35;
  }

  .detailed-stat.negative .ds-value {
    color: #e74c3c;
  }

  .ds-value {
    display: block;
    font-size: 1.8rem;
    font-weight: bold;
    color: #fff;
  }

  .ds-label {
    display: block;
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    margin-top: 5px;
  }

  /* Shooting Stats */
  .shooting-stats {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .shooting-stats h4 {
    color: #61dafb;
    margin-bottom: 15px;
    font-size: 0.95rem;
  }

  .shooting-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 15px;
  }

  .shooting-stat {
    text-align: center;
  }

  .shooting-label {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 5px;
  }

  .shooting-value {
    font-size: 1.2rem;
    font-weight: bold;
    color: #fff;
  }

  .shooting-pct {
    color: #2ecc71;
    font-size: 0.9rem;
  }

  /* Averages Inline */
  .averages-inline {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
  }

  .averages-inline h4 {
    color: #61dafb;
    margin-bottom: 10px;
    font-size: 0.95rem;
  }

  .averages-inline-grid {
    display: flex;
    justify-content: space-around;
    flex-wrap: wrap;
    gap: 10px;
  }

  .averages-inline-grid span {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.95rem;
  }

  @media (max-width: 600px) {
    .detailed-stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .detailed-stat.big {
      grid-column: span 3;
    }

    .shooting-grid {
      grid-template-columns: 1fr;
      gap: 10px;
    }
  }

  @media (max-width: 600px) {
    h1 {
      font-size: 1.5rem;
    }

    .timer-display {
      font-size: 2rem;
    }

    .summary-value {
      font-size: 1.5rem;
    }

    .charts-grid {
      grid-template-columns: 1fr;
    }

    .nav-tab {
      padding: 10px 20px;
      font-size: 0.9rem;
    }
  }

  /* Court Map Styles */
  .court-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .court-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .court-header h3 {
    color: #61dafb;
    margin: 0;
  }

  .clear-markers-btn {
    background: transparent;
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
    padding: 5px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
    transition: all 0.2s;
  }

  .clear-markers-btn:hover {
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .court-wrapper {
    position: relative;
  }

  .court-svg {
    width: 100%;
    max-width: 500px;
    height: auto;
    display: block;
    margin: 0 auto;
    cursor: crosshair;
    border-radius: 8px;
    box-shadow: 0 4px 20px rgba(0, 0, 0, 0.3);
  }

  .pending-marker {
    animation: pulse 0.8s ease-in-out infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; transform: scale(1); }
    50% { opacity: 0.7; transform: scale(1.1); }
  }

  .shot-modal {
    position: absolute;
    top: 50%;
    left: 50%;
    transform: translate(-50%, -50%);
    background: rgba(26, 26, 46, 0.98);
    border: 2px solid #61dafb;
    border-radius: 16px;
    padding: 25px;
    text-align: center;
    z-index: 100;
    min-width: 250px;
    box-shadow: 0 10px 40px rgba(0, 0, 0, 0.5);
    animation: modalIn 0.2s ease;
  }

  @keyframes modalIn {
    from { opacity: 0; transform: translate(-50%, -50%) scale(0.9); }
    to { opacity: 1; transform: translate(-50%, -50%) scale(1); }
  }

  .shot-type-badge {
    display: inline-block;
    padding: 8px 20px;
    border-radius: 20px;
    font-size: 1.2rem;
    font-weight: bold;
    margin-bottom: 15px;
  }

  .shot-type-badge[data-type="3pts"] {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    color: #fff;
  }

  .shot-type-badge[data-type="2pts"] {
    background: linear-gradient(135deg, #3498db, #2980b9);
    color: #fff;
  }

  .shot-modal p {
    margin-bottom: 20px;
    font-size: 1.1rem;
    color: rgba(255, 255, 255, 0.9);
  }

  .shot-modal-buttons {
    display: flex;
    gap: 15px;
    justify-content: center;
    margin-bottom: 15px;
  }

  .shot-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .shot-btn.made {
    background: #2ecc71;
    color: #fff;
  }

  .shot-btn.made:hover {
    background: #27ae60;
    transform: translateY(-2px);
  }

  .shot-btn.missed {
    background: #e74c3c;
    color: #fff;
  }

  .shot-btn.missed:hover {
    background: #c0392b;
    transform: translateY(-2px);
  }

  .shot-cancel {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.5);
    cursor: pointer;
    font-size: 0.9rem;
    padding: 5px 10px;
    transition: color 0.2s;
  }

  .shot-cancel:hover {
    color: rgba(255, 255, 255, 0.8);
  }

  .court-stats {
    display: flex;
    justify-content: center;
    gap: 40px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .court-stat {
    text-align: center;
  }

  .court-stat .made-count {
    color: #2ecc71;
    font-size: 1.5rem;
    font-weight: bold;
  }

  .court-stat .total-count {
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.2rem;
  }

  .court-stat .stat-label {
    display: block;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-top: 5px;
    text-transform: uppercase;
  }

  /* Court header buttons */
  .court-header-buttons {
    display: flex;
    gap: 10px;
    align-items: center;
  }

  .undo-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    width: 36px;
    height: 36px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 1.2rem;
    transition: all 0.2s;
  }

  .undo-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .marker-menu-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .marker-menu-btn:hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .marker-menu-btn.active {
    background: rgba(231, 76, 60, 0.3);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  /* Marker management menu */
  .marker-menu {
    background: rgba(0, 0, 0, 0.4);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
    animation: slideDown 0.2s ease;
  }

  .marker-menu-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .marker-menu-header span {
    color: #61dafb;
    font-weight: bold;
    font-size: 0.95rem;
  }

  .marker-menu-close {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.2rem;
    cursor: pointer;
    padding: 5px 10px;
    border-radius: 4px;
    transition: all 0.2s;
  }

  .marker-menu-close:hover {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
  }

  .marker-menu-section p {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-bottom: 10px;
  }

  .marker-menu-buttons {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
    margin-bottom: 15px;
  }

  .marker-quarter-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 15px;
    color: #fff;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 70px;
  }

  .marker-quarter-btn:not(.empty):hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
  }

  .marker-quarter-btn.empty {
    opacity: 0.3;
    cursor: not-allowed;
  }

  .marker-quarter-btn .q-label {
    font-size: 1.1rem;
    font-weight: bold;
    color: #61dafb;
  }

  .marker-quarter-btn .q-count {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .marker-menu-divider {
    height: 1px;
    background: rgba(255, 255, 255, 0.1);
    margin: 15px 0;
  }

  .clear-all-btn {
    background: rgba(231, 76, 60, 0.2);
    border: 1px solid #e74c3c;
    color: #e74c3c;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    width: 100%;
  }

  .clear-all-btn:hover {
    background: rgba(231, 76, 60, 0.4);
  }

  /* Court stats groups */
  .court-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 20px;
    padding-top: 15px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    flex-wrap: wrap;
  }

  .court-stat-group {
    display: flex;
    align-items: center;
    gap: 20px;
    background: rgba(255, 255, 255, 0.05);
    padding: 10px 20px;
    border-radius: 10px;
  }

  .court-stat-label {
    font-weight: bold;
    color: #61dafb;
    font-size: 0.9rem;
    text-transform: uppercase;
  }

  .court-stat-divider {
    width: 1px;
    height: 40px;
    background: rgba(255, 255, 255, 0.2);
  }

  /* Playing Time Section */
  .playing-time-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px 20px;
    margin-bottom: 20px;
  }

  .playing-time-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .playing-time-header h3 {
    color: #61dafb;
    margin: 0;
    font-size: 1rem;
  }

  .court-toggle {
    padding: 10px 20px;
    border-radius: 25px;
    border: 2px solid;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s;
  }

  .court-toggle.on-court {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    border-color: #2ecc71;
    color: #fff;
    box-shadow: 0 0 15px rgba(46, 204, 113, 0.4);
  }

  .court-toggle.on-bench {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }

  .court-toggle:hover {
    transform: scale(1.05);
  }

  .playing-time-display {
    display: flex;
    align-items: center;
    gap: 30px;
    flex-wrap: wrap;
  }

  .time-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
  }

  .time-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #2ecc71;
    font-family: 'Courier New', monospace;
  }

  .time-value.bench {
    color: rgba(255, 255, 255, 0.5);
  }

  .time-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
  }

  .per-minute-stats {
    display: flex;
    align-items: center;
    gap: 15px;
    background: rgba(97, 218, 251, 0.15);
    padding: 8px 15px;
    border-radius: 8px;
    margin-left: auto;
  }

  .pm-label {
    color: #61dafb;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .pm-stat {
    color: #fff;
    font-size: 0.9rem;
  }

  /* Quarter Stats Section */
  .quarter-stats-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .quarter-stats-section h3 {
    color: #61dafb;
    margin-bottom: 15px;
    font-size: 1rem;
  }

  .quarter-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 10px;
  }

  .quarter-stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 12px;
    text-align: center;
    border: 2px solid transparent;
    transition: all 0.2s;
  }

  .quarter-stat-card.current {
    border-color: #61dafb;
    background: rgba(97, 218, 251, 0.15);
  }

  .qs-header {
    font-weight: bold;
    color: #61dafb;
    font-size: 0.9rem;
    margin-bottom: 5px;
  }

  .qs-points {
    font-size: 1.5rem;
    font-weight: bold;
    color: #ff6b35;
    margin-bottom: 5px;
  }

  .qs-details {
    display: flex;
    flex-direction: column;
    gap: 2px;
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  /* Action History Section */
  .action-history-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .action-history-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .action-history-header h3 {
    color: #61dafb;
    margin: 0;
    font-size: 1rem;
  }

  .undo-action-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .undo-action-btn:hover {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .action-list {
    display: flex;
    flex-direction: column;
    gap: 8px;
    max-height: 200px;
    overflow-y: auto;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 8px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 6px;
  }

  .action-time {
    font-family: 'Courier New', monospace;
    font-size: 0.85rem;
    color: #61dafb;
    min-width: 70px;
  }

  .action-label {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
  }

  .action-more {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    padding: 8px;
  }

  @media (max-width: 600px) {
    .quarter-stats-grid {
      grid-template-columns: repeat(2, 1fr);
    }

    .playing-time-display {
      flex-direction: column;
      align-items: flex-start;
      gap: 15px;
    }

    .per-minute-stats {
      margin-left: 0;
      width: 100%;
      justify-content: center;
    }
  }

  /* PIN Lock Styles */
  .pin-lock-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 9999;
  }

  .pin-lock-container {
    text-align: center;
    padding: 40px;
    max-width: 350px;
    width: 100%;
  }

  .pin-lock-icon {
    font-size: 4rem;
    margin-bottom: 15px;
  }

  .pin-lock-container h2 {
    color: #61dafb;
    margin-bottom: 30px;
    font-size: 1.8rem;
  }

  .pin-instruction {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 25px;
    font-size: 1rem;
  }

  .pin-dots {
    display: flex;
    justify-content: center;
    gap: 12px;
    margin-bottom: 20px;
  }

  .pin-dot {
    width: 16px;
    height: 16px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.3);
    background: transparent;
    transition: all 0.2s;
  }

  .pin-dot.filled {
    background: #61dafb;
    border-color: #61dafb;
  }

  .pin-error {
    color: #e74c3c;
    font-size: 0.9rem;
    margin-bottom: 15px;
  }

  .pin-keypad {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 12px;
    margin-bottom: 25px;
    max-width: 280px;
    margin-left: auto;
    margin-right: auto;
  }

  .pin-key {
    width: 70px;
    height: 70px;
    border-radius: 50%;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.05);
    color: #fff;
    font-size: 1.8rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .pin-key:hover:not(:disabled) {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
  }

  .pin-key:active:not(:disabled) {
    transform: scale(0.95);
  }

  .pin-key-empty {
    visibility: hidden;
  }

  .pin-key-back {
    font-size: 1.5rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .pin-key-back:hover {
    color: #e74c3c;
    border-color: #e74c3c;
    background: rgba(231, 76, 60, 0.2);
  }

  .pin-submit {
    background: linear-gradient(135deg, #61dafb 0%, #4fa8c7 100%);
    border: none;
    color: #000;
    padding: 15px 50px;
    border-radius: 30px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .pin-submit:hover:not(:disabled) {
    transform: translateY(-2px);
    box-shadow: 0 5px 20px rgba(97, 218, 251, 0.4);
  }

  .pin-submit:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .pin-back-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    margin-top: 20px;
    cursor: pointer;
    font-size: 0.95rem;
  }

  .pin-back-btn:hover {
    color: #fff;
  }
`

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('match')
  const [opponent, setOpponent] = useState('')

  // Check if already unlocked this session
  useEffect(() => {
    const sessionUnlocked = sessionStorage.getItem('basketAppUnlocked')
    if (sessionUnlocked === 'true') {
      setIsUnlocked(true)
    }
  }, [])

  const handleUnlock = () => {
    setIsUnlocked(true)
    sessionStorage.setItem('basketAppUnlocked', 'true')
  }

  const { stats, updateStat, resetStats, importStats, getSummary, actionHistory, getStatsByQuarter, undoLastAction } = useStats()
  const { player, updatePlayer } = usePlayer()
  const timer = useTimer()
  const { history, saveMatch, deleteMatch, clearHistory, getAverages } = useMatchHistory()
  const playingTime = usePlayingTime()

  const summary = getSummary()
  const averages = getAverages()
  const quarterStats = getStatsByQuarter()

  // Track playing time when timer is running
  useEffect(() => {
    return playingTime.trackTime(timer.isRunning)
  }, [timer.isRunning, playingTime.isOnCourt])

  // Helper to update stat with current time
  const updateStatWithTime = (statName, delta, silent = false) => {
    updateStat(statName, delta, timer.quarter, timer.timeLeft, silent)
  }

  // Shot management: made shots automatically count as attempted
  const handleShotMadeIncrement = (madeKey, attemptedKey) => {
    updateStatWithTime(madeKey, 1)  // Record in history: "2PTS réussi"
    updateStatWithTime(attemptedKey, 1, true)  // Silent: don't record attempted
  }

  const handleShotMadeDecrement = (madeKey, attemptedKey) => {
    // Decrement made = convert a made shot to a miss
    if (stats[madeKey] > 0) {
      updateStatWithTime(madeKey, -1)  // Remove "réussi" from history
      // attempted stays the same (shot becomes a miss)
    }
  }

  const handleShotAttemptedIncrement = (attemptedKey) => {
    // This is called for missed shots
    updateStatWithTime(attemptedKey, 1)  // Record in history: "2PTS raté"
  }

  const handleShotAttemptedDecrement = (madeKey, attemptedKey) => {
    // Can only decrement if attempted > made (i.e., there are misses to remove)
    if (stats[attemptedKey] > stats[madeKey]) {
      updateStatWithTime(attemptedKey, -1)  // Remove "raté" from history
    }
  }

  // Calculate per-minute stats
  const getPerMinuteStats = () => {
    const minutes = playingTime.playingTime / 60
    if (minutes < 1) return null

    const totalPoints = (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade
    const totalRebounds = stats.offRebounds + stats.defRebounds

    return {
      points: (totalPoints / minutes).toFixed(1),
      rebounds: (totalRebounds / minutes).toFixed(1),
      assists: (stats.assists / minutes).toFixed(1)
    }
  }

  const perMinuteStats = getPerMinuteStats()

  const handleSaveMatch = () => {
    if (!player.name) {
      alert('Entre le nom du joueur avant de sauvegarder !')
      return
    }

    const totalPoints = (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade
    if (totalPoints === 0 && stats.assists === 0 && stats.offRebounds + stats.defRebounds === 0) {
      alert('Aucune statistique à sauvegarder !')
      return
    }

    saveMatch(player, stats, opponent)
    alert('Match sauvegardé !')

    // Reset for next match
    resetStats()
    timer.resetTimer()
    playingTime.resetPlayingTime()
    setOpponent('')
  }

  const handleDeleteMatch = (matchId) => {
    if (confirm('Supprimer ce match ?')) {
      deleteMatch(matchId)
    }
  }

  const handleClearHistory = () => {
    if (confirm('Supprimer tout l\'historique ? Cette action est irréversible.')) {
      clearHistory()
    }
  }

  const exportData = () => {
    const data = {
      player,
      stats,
      summary,
      exportDate: new Date().toISOString()
    }
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = `stats_${player.name || 'joueur'}_${new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleImport = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.player) {
            updatePlayer('name', data.player.name || '')
            updatePlayer('number', data.player.number || '')
          }
          if (data.stats) {
            importStats(data.stats)
          }
          alert('Données importées avec succès !')
        } catch {
          alert('Erreur lors de l\'import : fichier invalide')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  const handleReset = () => {
    if (confirm('Voulez-vous vraiment réinitialiser toutes les statistiques ?')) {
      resetStats()
    }
  }

  const handleShotRecorded = (isThreePointer, made) => {
    if (isThreePointer) {
      if (made) {
        handleShotMadeIncrement('fg3Made', 'fg3Attempted')
      } else {
        handleShotAttemptedIncrement('fg3Attempted')
      }
    } else {
      if (made) {
        handleShotMadeIncrement('fg2Made', 'fg2Attempted')
      } else {
        handleShotAttemptedIncrement('fg2Attempted')
      }
    }
  }

  // Show PIN lock if not unlocked
  if (!isUnlocked) {
    return (
      <>
        <style>{styles}</style>
        <PinLock onUnlock={handleUnlock} />
      </>
    )
  }

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <h1>🏀 Stats Basket <span className="badge">React</span></h1>

        {/* Navigation */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            🎮 Match en cours
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📊 Historique ({history.length})
          </button>
        </div>

        {activeTab === 'match' ? (
          <>
            <PlayerInfo
              name={player.name}
              number={player.number}
              onNameChange={(v) => updatePlayer('name', v)}
              onNumberChange={(v) => updatePlayer('number', v)}
            />

            <Timer
              quarter={timer.quarter}
              formattedTime={timer.formatTime()}
              isRunning={timer.isRunning}
              quarterDuration={timer.quarterDuration}
              onToggle={timer.toggleTimer}
              onReset={timer.resetQuarter}
              onNext={timer.nextQuarter}
              onPrev={timer.prevQuarter}
              onDurationChange={timer.updateQuarterDuration}
              onEndMatch={() => {
                if (timer.isRunning) timer.toggleTimer() // Stop timer if running
                document.querySelector('.save-match-section')?.scrollIntoView({ behavior: 'smooth' })
              }}
              onAdjustTime={timer.adjustTime}
            />

            <CourtMap onShotRecorded={handleShotRecorded} quarter={timer.quarter} />

            {/* Playing Time Toggle */}
            <div className="playing-time-section">
              <div className="playing-time-header">
                <h3>⏱️ Temps de jeu</h3>
                <button
                  className={`court-toggle ${playingTime.isOnCourt ? 'on-court' : 'on-bench'}`}
                  onClick={playingTime.toggleOnCourt}
                >
                  {playingTime.isOnCourt ? '🏃 Sur le terrain' : '🪑 Sur le banc'}
                </button>
              </div>
              <div className="playing-time-display">
                <div className="time-stat">
                  <span className="time-value">{playingTime.formatPlayingTime(playingTime.playingTime)}</span>
                  <span className="time-label">Temps de jeu</span>
                </div>
                <div className="time-stat">
                  <span className="time-value bench">{playingTime.formatPlayingTime(playingTime.benchTime)}</span>
                  <span className="time-label">Temps banc</span>
                </div>
                {perMinuteStats && (
                  <div className="per-minute-stats">
                    <span className="pm-label">Par minute:</span>
                    <span className="pm-stat">{perMinuteStats.points} pts</span>
                    <span className="pm-stat">{perMinuteStats.rebounds} reb</span>
                    <span className="pm-stat">{perMinuteStats.assists} ast</span>
                  </div>
                )}
              </div>
            </div>

            <div className="stats-grid">
              <div className="stat-card">
                <h3>🎯 Points</h3>
                <StatCounter label="Tirs 2pts réussis" value={stats.fg2Made}
                  onIncrement={() => handleShotMadeIncrement('fg2Made', 'fg2Attempted')}
                  onDecrement={() => handleShotMadeDecrement('fg2Made', 'fg2Attempted')} />
                <StatCounter label="Tirs 2pts ratés" value={stats.fg2Attempted - stats.fg2Made}
                  onIncrement={() => handleShotAttemptedIncrement('fg2Attempted')}
                  onDecrement={() => handleShotAttemptedDecrement('fg2Made', 'fg2Attempted')} />
                <StatCounter label="Tirs 3pts réussis" value={stats.fg3Made}
                  onIncrement={() => handleShotMadeIncrement('fg3Made', 'fg3Attempted')}
                  onDecrement={() => handleShotMadeDecrement('fg3Made', 'fg3Attempted')} />
                <StatCounter label="Tirs 3pts ratés" value={stats.fg3Attempted - stats.fg3Made}
                  onIncrement={() => handleShotAttemptedIncrement('fg3Attempted')}
                  onDecrement={() => handleShotAttemptedDecrement('fg3Made', 'fg3Attempted')} />
                <StatCounter label="LF réussis" value={stats.ftMade}
                  onIncrement={() => handleShotMadeIncrement('ftMade', 'ftAttempted')}
                  onDecrement={() => handleShotMadeDecrement('ftMade', 'ftAttempted')} />
                <StatCounter label="LF ratés" value={stats.ftAttempted - stats.ftMade}
                  onIncrement={() => handleShotAttemptedIncrement('ftAttempted')}
                  onDecrement={() => handleShotAttemptedDecrement('ftMade', 'ftAttempted')} />
              </div>

              <div className="stat-card">
                <h3>📊 Rebonds</h3>
                <StatCounter label="Rebonds offensifs" value={stats.offRebounds}
                  onIncrement={() => updateStatWithTime('offRebounds', 1)}
                  onDecrement={() => updateStatWithTime('offRebounds', -1)} />
                <StatCounter label="Rebonds défensifs" value={stats.defRebounds}
                  onIncrement={() => updateStatWithTime('defRebounds', 1)}
                  onDecrement={() => updateStatWithTime('defRebounds', -1)} />
              </div>

              <div className="stat-card">
                <h3>⚡ Autres</h3>
                <StatCounter label="Passes décisives" value={stats.assists}
                  onIncrement={() => updateStatWithTime('assists', 1)}
                  onDecrement={() => updateStatWithTime('assists', -1)} />
                <StatCounter label="Interceptions" value={stats.steals}
                  onIncrement={() => updateStatWithTime('steals', 1)}
                  onDecrement={() => updateStatWithTime('steals', -1)} />
                <StatCounter label="Contres" value={stats.blocks}
                  onIncrement={() => updateStatWithTime('blocks', 1)}
                  onDecrement={() => updateStatWithTime('blocks', -1)} />
                <StatCounter label="Fautes" value={stats.fouls}
                  onIncrement={() => updateStatWithTime('fouls', 1)}
                  onDecrement={() => updateStatWithTime('fouls', -1)} />
                <StatCounter label="Pertes de balle" value={stats.turnovers}
                  onIncrement={() => updateStatWithTime('turnovers', 1)}
                  onDecrement={() => updateStatWithTime('turnovers', -1)} />
              </div>
            </div>

            {/* Stats by Quarter */}
            <div className="quarter-stats-section">
              <h3>📊 Stats par quart-temps</h3>
              <div className="quarter-stats-grid">
                {quarterStats.map(qs => (
                  <div key={qs.quarter} className={`quarter-stat-card ${timer.quarter === qs.quarter ? 'current' : ''}`}>
                    <div className="qs-header">Q{qs.quarter}</div>
                    <div className="qs-points">{qs.points} pts</div>
                    <div className="qs-details">
                      <span>{qs.fg} FG</span>
                      <span>{qs.rebounds} reb</span>
                      <span>{qs.assists} ast</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Action History (Play-by-Play) */}
            {actionHistory.length > 0 && (
              <div className="action-history-section">
                <div className="action-history-header">
                  <h3>📝 Historique des actions</h3>
                  <button className="undo-action-btn" onClick={undoLastAction}>
                    ↩ Annuler
                  </button>
                </div>
                <div className="action-list">
                  {actionHistory.slice(0, 10).map(action => (
                    <div key={action.id} className="action-item">
                      <span className="action-time">Q{action.quarter} {Math.floor(action.timeLeft / 60)}:{(action.timeLeft % 60).toString().padStart(2, '0')}</span>
                      <span className="action-label">{action.label}</span>
                    </div>
                  ))}
                  {actionHistory.length > 10 && (
                    <div className="action-more">+{actionHistory.length - 10} autres actions</div>
                  )}
                </div>
              </div>
            )}

            <StatsDisplay summary={summary} />

            {/* Save Match Section */}
            <div className="save-match-section">
              <h3>💾 Sauvegarder le match</h3>
              <div className="save-match-form">
                <input
                  type="text"
                  placeholder="Adversaire (optionnel)"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                />
                <button className="save-btn" onClick={handleSaveMatch}>
                  Sauvegarder et terminer
                </button>
              </div>
            </div>

            <div className="actions">
              <button className="action-btn" onClick={exportData}>📥 Exporter JSON</button>
              <button className="action-btn" onClick={handleImport}>📤 Importer</button>
              <button className="action-btn danger" onClick={handleReset}>🗑 Réinitialiser</button>
            </div>
          </>
        ) : (
          <MatchHistory
            history={history}
            averages={averages}
            onDelete={handleDeleteMatch}
            onClear={handleClearHistory}
          />
        )}
      </div>
    </>
  )
}
