import { useState, useEffect } from 'react'
import { useStats, usePlayer, useTimer, useMatchHistory, usePlayingTime } from './hooks/useStats'
import StatCounter from './components/StatCounter'
import Timer from './components/Timer'
import PlayerInfo from './components/PlayerInfo'
import StatsDisplay from './components/StatsDisplay'
import MatchHistory from './components/MatchHistory'
import CourtMap from './components/CourtMap'
import ShotReplay from './components/ShotReplay'
import EvolutionChart from './components/EvolutionChart'
import PerformanceRadar from './components/PerformanceRadar'
import ShotHeatmap from './components/ShotHeatmap'
import ThermalHeatmap from './components/ThermalHeatmap'

const styles = `
  * {
    margin: 0;
    padding: 0;
    box-sizing: border-box;
  }

  /* Global Animations */
  @keyframes fadeIn {
    from { opacity: 0; transform: translateY(10px); }
    to { opacity: 1; transform: translateY(0); }
  }

  @keyframes popIn {
    0% { transform: scale(0.8); opacity: 0; }
    50% { transform: scale(1.05); }
    100% { transform: scale(1); opacity: 1; }
  }

  @keyframes pulse {
    0%, 100% { transform: scale(1); }
    50% { transform: scale(1.02); }
  }

  @keyframes shake {
    0%, 100% { transform: translateX(0); }
    25% { transform: translateX(-3px); }
    75% { transform: translateX(3px); }
  }

  @keyframes bounce {
    0%, 100% { transform: translateY(0); }
    50% { transform: translateY(-5px); }
  }

  @keyframes glow {
    0%, 100% { box-shadow: 0 0 5px rgba(97, 218, 251, 0.3); }
    50% { box-shadow: 0 0 20px rgba(97, 218, 251, 0.6); }
  }

  @keyframes slideIn {
    from { opacity: 0; transform: translateX(-20px); }
    to { opacity: 1; transform: translateX(0); }
  }

  @keyframes numberPop {
    0% { transform: scale(1); }
    50% { transform: scale(1.3); color: #61dafb; }
    100% { transform: scale(1); }
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
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .nav-tab::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.4s, height 0.4s;
  }

  .nav-tab:hover::after {
    width: 200px;
    height: 200px;
  }

  .nav-tab:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
    transform: translateY(-2px);
  }

  .nav-tab:active {
    transform: translateY(0) scale(0.98);
  }

  .nav-tab.active {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
    animation: glow 2s infinite;
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
    transition: color 0.3s, text-shadow 0.3s;
  }

  .timer-display.running {
    color: #2ecc71;
    text-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
    animation: pulse 1s infinite;
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
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 2000;
    animation: fadeIn 0.2s ease;
  }

  .confirm-modal {
    background: linear-gradient(135deg, rgba(26, 26, 46, 0.98) 0%, rgba(22, 33, 62, 0.98) 100%);
    border: 2px solid #61dafb;
    border-radius: 12px;
    padding: 20px 25px;
    text-align: center;
    animation: scaleIn 0.2s ease;
    margin: 10px;
  }

  @keyframes scaleIn {
    from { transform: scale(0.9); opacity: 0; }
    to { transform: scale(1); opacity: 1; }
  }

  .confirm-icon {
    font-size: 1.8rem;
    margin-bottom: 10px;
    color: #61dafb;
  }

  .confirm-modal p {
    font-size: 1rem;
    margin-bottom: 5px;
  }

  .confirm-warning {
    font-size: 0.8rem !important;
    color: rgba(255, 255, 255, 0.5);
    margin-bottom: 15px !important;
  }

  .confirm-buttons {
    display: flex;
    gap: 10px;
    justify-content: center;
  }

  .confirm-btn {
    padding: 8px 16px;
    border: none;
    border-radius: 8px;
    font-size: 0.9rem;
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
    animation: fadeIn 0.4s ease-out;
    transition: transform 0.3s, box-shadow 0.3s;
  }

  .stat-card:hover {
    transform: translateY(-3px);
    box-shadow: 0 10px 30px rgba(0, 0, 0, 0.3);
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
    width: 36px;
    height: 36px;
    border: none;
    border-radius: 50%;
    cursor: pointer;
    font-size: 1.2rem;
    font-weight: bold;
    transition: all 0.15s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .stat-btn::before {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.3s, height 0.3s;
  }

  .stat-btn:active::before {
    width: 100px;
    height: 100px;
  }

  .stat-btn:active {
    transform: scale(0.9);
  }

  .stat-btn:hover {
    transform: scale(1.15);
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .stat-btn.minus {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: #fff;
  }

  .stat-btn.minus:hover {
    background: linear-gradient(135deg, #ff6b5b, #e74c3c);
  }

  .stat-btn.plus {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: #fff;
  }

  .stat-btn.plus:hover {
    background: linear-gradient(135deg, #4ade80, #2ecc71);
  }

  .stat-value {
    transition: transform 0.2s, color 0.2s;
    display: inline-block;
  }

  .stat-value.pop {
    animation: numberPop 0.3s ease-out;
  }

  .stat-value.pop.up {
    color: #2ecc71;
  }

  .stat-value.pop.down {
    color: #e74c3c;
  }

  .stat-value-inner {
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

  .opponent-input {
    min-width: 180px !important;
  }

  .score-inputs {
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .score-input {
    width: 90px !important;
    min-width: 90px !important;
    text-align: center;
  }

  .score-input::-webkit-inner-spin-button,
  .score-input::-webkit-outer-spin-button {
    -webkit-appearance: none;
    margin: 0;
  }

  .score-input[type=number] {
    -moz-appearance: textfield;
  }

  .score-separator {
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .score-inputs.auto-score {
    background: rgba(97, 218, 251, 0.1);
    padding: 10px 15px;
    border-radius: 8px;
    border: 1px solid rgba(97, 218, 251, 0.3);
  }

  .auto-score-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-right: 5px;
  }

  .auto-score-value {
    color: #61dafb;
    font-size: 1.3rem;
    font-weight: bold;
    min-width: 30px;
    text-align: center;
  }

  .match-notes-section {
    display: flex;
    flex-direction: column;
    gap: 10px;
    width: 100%;
  }

  .match-notes-input {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 10px 12px;
    color: #fff;
    font-size: 0.9rem;
    resize: none;
    font-family: inherit;
    width: 100%;
  }

  .match-notes-input::placeholder {
    color: rgba(255, 255, 255, 0.5);
  }

  .match-notes-input:focus {
    outline: none;
    border-color: #61dafb;
  }

  .location-toggle {
    display: flex;
    gap: 8px;
  }

  .location-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.6);
    padding: 8px 14px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .location-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    color: #fff;
  }

  .location-btn.active {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
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

  .match-list-actions {
    display: flex;
    gap: 10px;
  }

  .import-btn {
    background: transparent;
    border: 1px solid #61dafb;
    color: #61dafb;
    padding: 6px 12px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .import-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    transform: scale(1.05);
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
    transform: scale(1.05);
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

  .match-location {
    font-size: 1.1rem;
  }

  .match-opponent {
    color: #61dafb;
    font-weight: bold;
  }

  .match-playtime {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
  }

  .compare-section {
    margin-top: 8px;
  }

  .compare-section label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .compare-view {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 15px;
  }

  .compare-view h3 {
    color: #61dafb;
    text-align: center;
    margin-bottom: 12px;
    font-size: 1rem;
  }

  .compare-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 12px;
    padding-bottom: 10px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .compare-team {
    color: #fff;
    font-weight: bold;
    font-size: 0.85rem;
    text-align: center;
    flex: 1;
  }

  .compare-vs {
    color: rgba(255, 255, 255, 0.4);
    font-size: 0.8rem;
    padding: 0 10px;
  }

  .compare-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 6px 0;
    border-bottom: 1px solid rgba(255, 255, 255, 0.05);
  }

  .compare-val {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.95rem;
    width: 60px;
    text-align: center;
  }

  .compare-val.better {
    color: #2ecc71;
    font-weight: bold;
  }

  .compare-label {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    text-align: center;
    flex: 1;
  }

  .match-score {
    padding: 4px 10px;
    border-radius: 6px;
    font-weight: bold;
    font-size: 0.95rem;
  }

  .match-score.win {
    background: rgba(46, 204, 113, 0.2);
    color: #2ecc71;
  }

  .match-score.loss {
    background: rgba(231, 76, 60, 0.2);
    color: #e74c3c;
  }

  .match-score.draw {
    background: rgba(241, 196, 15, 0.2);
    color: #f1c40f;
  }

  .edit-btn {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.4);
    font-size: 1.1rem;
    cursor: pointer;
    padding: 0 8px;
    line-height: 1;
    transition: color 0.2s;
  }

  .edit-btn:hover {
    color: #61dafb;
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

  .match-stat.positive .stat-val {
    color: #2ecc71;
  }

  .match-stat.negative .stat-val {
    color: #e74c3c;
  }

  .match-stat.efficiency .stat-val {
    color: #61dafb;
  }

  .match-stat.efficiency.positive .stat-val {
    color: #2ecc71;
  }

  .match-stat.efficiency.negative .stat-val {
    color: #e74c3c;
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

  .detailed-stats-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 20px;
    gap: 15px;
  }

  .detailed-stats-section h3 {
    color: #61dafb;
    margin: 0;
    text-align: center;
    flex: 1;
  }

  .replay-btn-history {
    background: linear-gradient(135deg, #9b59b6, #8e44ad);
    color: white;
    border: none;
    padding: 10px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    font-weight: bold;
    transition: all 0.2s;
    white-space: nowrap;
  }

  .replay-btn-history:hover {
    background: linear-gradient(135deg, #a66bbe, #9b59b6);
    transform: scale(1.05);
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

  .detailed-stat.positive .ds-value {
    color: #2ecc71;
  }

  .detailed-stat.efficiency .ds-value {
    color: #61dafb;
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

  /* Match Notes Display */
  .match-notes-display {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-top: 15px;
  }

  .match-notes-display h4 {
    color: #61dafb;
    margin-bottom: 12px;
    font-size: 0.95rem;
  }

  .note-item {
    display: flex;
    align-items: flex-start;
    gap: 10px;
    padding: 10px;
    border-radius: 8px;
    margin-bottom: 8px;
  }

  .note-item:last-child {
    margin-bottom: 0;
  }

  .note-item.strengths {
    background: rgba(46, 204, 113, 0.1);
    border-left: 3px solid #2ecc71;
  }

  .note-item.improvements {
    background: rgba(241, 196, 15, 0.1);
    border-left: 3px solid #f1c40f;
  }

  .note-icon {
    font-size: 1.1rem;
    flex-shrink: 0;
  }

  .note-text {
    color: rgba(255, 255, 255, 0.9);
    font-size: 0.9rem;
    line-height: 1.4;
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

  .rolling-averages {
    margin-top: 12px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .rolling-averages h5 {
    color: rgba(97, 218, 251, 0.8);
    font-size: 0.85rem;
    margin-bottom: 8px;
  }

  .quarter-stats-display, .playing-time-display {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
  }

  .quarter-stats-display h4, .playing-time-display h4 {
    color: #61dafb;
    margin-bottom: 10px;
    font-size: 0.95rem;
  }

  .quarter-stats-grid {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .quarter-stat-card {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 8px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .qs-quarter {
    color: #61dafb;
    font-weight: bold;
    font-size: 0.85rem;
  }

  .qs-points {
    color: #fff;
    font-weight: bold;
    font-size: 1rem;
  }

  .qs-detail {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
  }

  .playing-time-grid {
    display: flex;
    justify-content: space-around;
  }

  .playing-time-item {
    text-align: center;
  }

  .pt-value {
    display: block;
    color: #fff;
    font-size: 1.2rem;
    font-weight: bold;
  }

  .pt-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.8rem;
  }

  .goals-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 10px;
  }

  .goal-input label {
    display: block;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.8rem;
    margin-bottom: 4px;
  }

  .goal-input input {
    width: 100%;
    padding: 8px;
    border-radius: 8px;
    border: 1px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1rem;
    text-align: center;
  }

  .goals-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
  }

  .goals-section h4 {
    color: #61dafb;
    margin-bottom: 10px;
    font-size: 0.95rem;
  }

  .goals-progress-grid {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .goal-progress {
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .goal-info {
    display: flex;
    justify-content: space-between;
    font-size: 0.85rem;
  }

  .goal-label {
    color: rgba(255, 255, 255, 0.7);
  }

  .goal-values {
    color: #fff;
    font-weight: bold;
  }

  .goal-bar {
    height: 8px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 4px;
    overflow: hidden;
  }

  .goal-fill {
    height: 100%;
    background: #61dafb;
    border-radius: 4px;
    transition: width 0.3s ease;
  }

  .goal-fill.reached {
    background: #2ecc71;
  }

  .match-actions-row {
    display: flex;
    gap: 6px;
  }

  .share-btn-history {
    background: rgba(97, 218, 251, 0.15);
    border: 1px solid rgba(97, 218, 251, 0.3);
    color: #61dafb;
    padding: 4px 10px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.8rem;
  }

  .share-btn-history:active {
    background: rgba(97, 218, 251, 0.3);
  }

  .training-page {
    padding: 10px 0;
  }

  .training-page h2 {
    text-align: center;
    color: #61dafb;
    margin-bottom: 5px;
  }

  .training-desc {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.85rem;
    margin-bottom: 15px;
  }

  .training-stats {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
    margin-top: 15px;
  }

  .training-stat {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
    padding: 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
  }

  .training-stat.total {
    background: rgba(97, 218, 251, 0.1);
  }

  .ts-label {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.75rem;
    font-weight: bold;
  }

  .ts-value {
    color: #fff;
    font-size: 1.1rem;
    font-weight: bold;
  }

  .ts-pct {
    color: #61dafb;
    font-size: 0.9rem;
  }

  .training-reset {
    width: 100%;
    margin-top: 15px;
    padding: 12px;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    border-radius: 10px;
    font-size: 0.9rem;
    cursor: pointer;
  }

  .match-photo-display {
    text-align: center;
    margin-bottom: 10px;
  }

  .match-photo-display img {
    max-width: 100%;
    max-height: 250px;
    border-radius: 10px;
    object-fit: cover;
  }

  .undo-floating {
    position: sticky;
    bottom: 70px;
    width: 100%;
    padding: 12px;
    background: rgba(231, 76, 60, 0.9);
    color: #fff;
    border: none;
    border-radius: 10px;
    font-size: 0.9rem;
    font-weight: bold;
    cursor: pointer;
    z-index: 50;
    text-align: center;
    margin-top: 10px;
  }

  .undo-floating:active {
    background: rgba(231, 76, 60, 1);
    transform: scale(0.98);
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

  /* Match Header Compact - Responsive */
  .match-header-compact {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: clamp(8px, 2vw, 15px) clamp(10px, 3vw, 20px);
    margin-bottom: 10px;
  }

  .player-timer-row {
    display: flex;
    justify-content: space-between;
    align-items: center;
    gap: clamp(5px, 2vw, 15px);
    flex-wrap: wrap;
  }

  .player-compact {
    display: flex;
    flex-direction: column;
    gap: 2px;
  }

  .player-name-compact {
    font-size: clamp(0.8rem, 2.5vw, 1.1rem);
    font-weight: bold;
    color: #fff;
  }

  .player-number-compact {
    font-size: clamp(0.65rem, 2vw, 0.85rem);
    color: #61dafb;
  }

  .timer-compact {
    display: flex;
    align-items: center;
    gap: clamp(4px, 1.5vw, 12px);
  }

  .quarter-compact {
    background: rgba(97, 218, 251, 0.2);
    color: #61dafb;
    padding: clamp(3px, 1vw, 6px) clamp(6px, 2vw, 12px);
    border-radius: 6px;
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    font-weight: bold;
  }

  .time-compact {
    font-size: clamp(1.1rem, 4vw, 1.8rem);
    font-weight: bold;
    font-family: 'Courier New', monospace;
    color: #fff;
  }

  .time-compact.running {
    color: #2ecc71;
  }

  .timer-toggle-compact {
    background: rgba(97, 218, 251, 0.2);
    border: none;
    color: #61dafb;
    width: clamp(30px, 8vw, 44px);
    height: clamp(30px, 8vw, 44px);
    border-radius: 50%;
    font-size: clamp(0.85rem, 2.5vw, 1.2rem);
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .score-compact {
    display: flex;
    align-items: center;
    gap: clamp(3px, 1vw, 8px);
    font-size: clamp(1rem, 3.5vw, 1.5rem);
    font-weight: bold;
  }

  .score-compact .score-sep {
    color: rgba(255, 255, 255, 0.5);
  }

  .playing-time-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(10px, 3vw, 20px);
    margin-top: clamp(8px, 2vw, 12px);
    padding-top: clamp(8px, 2vw, 12px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .court-toggle-compact {
    background: rgba(255, 255, 255, 0.1);
    border: none;
    color: rgba(255, 255, 255, 0.8);
    padding: clamp(6px, 1.5vw, 10px) clamp(12px, 3vw, 20px);
    border-radius: 20px;
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    cursor: pointer;
    transition: all 0.2s;
  }

  .court-toggle-compact.on-court {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
    color: #fff;
  }

  .court-toggle-compact.on-bench {
    background: rgba(231, 76, 60, 0.3);
    color: #e74c3c;
  }

  .playing-time-compact {
    font-size: clamp(0.75rem, 2vw, 1rem);
    color: rgba(255, 255, 255, 0.7);
  }

  /* Live Score Row - in header */
  .live-score-row {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(15px, 4vw, 30px);
    margin-top: clamp(8px, 2vw, 12px);
    padding-top: clamp(8px, 2vw, 12px);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .score-team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 4px;
  }

  .score-label {
    font-size: clamp(0.6rem, 1.8vw, 0.8rem);
    color: rgba(255, 255, 255, 0.5);
    text-transform: uppercase;
  }

  .score-controls {
    display: flex;
    align-items: center;
    gap: clamp(6px, 2vw, 12px);
  }

  .score-controls button {
    background: rgba(97, 218, 251, 0.2);
    border: none;
    color: #61dafb;
    width: clamp(28px, 8vw, 40px);
    height: clamp(28px, 8vw, 40px);
    border-radius: 50%;
    font-size: clamp(1rem, 3vw, 1.4rem);
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
  }

  .score-controls button:active {
    background: rgba(97, 218, 251, 0.4);
    transform: scale(0.95);
  }

  .score-value {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: bold;
    color: #fff;
    min-width: clamp(35px, 10vw, 60px);
    text-align: center;
  }

  .score-vs {
    font-size: clamp(1.2rem, 4vw, 2rem);
    color: rgba(255, 255, 255, 0.4);
    font-weight: bold;
  }

  /* Stats Categories */
  .stats-category {
    margin-bottom: clamp(4px, 1vw, 8px);
  }

  .stats-category-title {
    font-size: clamp(0.6rem, 2vw, 0.75rem);
    color: #61dafb;
    text-transform: uppercase;
    letter-spacing: 0.5px;
    margin: 0 0 clamp(2px, 0.5vw, 4px) 0;
    padding: clamp(2px, 0.5vw, 4px) clamp(6px, 1.5vw, 10px);
    background: rgba(97, 218, 251, 0.15);
    border-left: 2px solid #61dafb;
    border-radius: 0 3px 3px 0;
    display: inline-block;
  }

  .qs-positive .qs-value {
    color: #2ecc71;
  }

  /* Quick Stats Grid - Responsive */
  .quick-stats-grid {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: clamp(3px, 1vw, 8px);
    margin-bottom: 4px;
    padding: 0;
  }

  .quick-stat {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 6px;
    padding: clamp(4px, 1.5vw, 10px) clamp(2px, 0.8vw, 8px);
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    min-width: 0;
  }

  .quick-stat .qs-label {
    display: block;
    font-size: clamp(0.5rem, 1.8vw, 0.7rem);
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    margin-bottom: clamp(2px, 0.5vw, 4px);
    white-space: nowrap;
  }

  .quick-stat .qs-controls {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: clamp(1px, 0.5vw, 6px);
    width: 100%;
  }

  .quick-stat .qs-controls button {
    background: rgba(97, 218, 251, 0.25);
    border: none;
    color: #61dafb;
    width: clamp(22px, 7vw, 34px);
    height: clamp(22px, 7vw, 34px);
    border-radius: 50%;
    font-size: clamp(0.75rem, 2.5vw, 1.1rem);
    font-weight: bold;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    flex-shrink: 0;
    padding: 0;
  }

  .quick-stat .qs-controls button:active {
    background: rgba(97, 218, 251, 0.5);
    transform: scale(0.95);
  }

  .quick-stat .qs-value {
    font-size: clamp(0.65rem, 2.5vw, 1rem);
    font-weight: bold;
    color: #fff;
    min-width: 0;
    flex: 1;
    text-align: center;
  }

  /* Tablet: 6 columns (one row per category) */
  @media screen and (min-width: 500px) {
    .quick-stats-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  /* Large tablet / Desktop */
  @media screen and (min-width: 800px) {
    .quick-stats-grid {
      grid-template-columns: repeat(6, 1fr);
    }
  }

  /* Points Total Display - Responsive */
  .points-total-display {
    background: linear-gradient(135deg, rgba(97, 218, 251, 0.2), rgba(97, 218, 251, 0.1));
    border-radius: 12px;
    padding: clamp(10px, 2.5vw, 20px);
    display: flex;
    align-items: center;
    justify-content: center;
    gap: clamp(10px, 3vw, 20px);
    margin-bottom: 15px;
    flex-wrap: wrap;
  }

  .points-total-display .pts-label {
    font-size: clamp(0.7rem, 2vw, 0.95rem);
    color: rgba(255, 255, 255, 0.6);
  }

  .points-total-display .pts-value {
    font-size: clamp(1.5rem, 5vw, 2.5rem);
    font-weight: bold;
    color: #61dafb;
  }

  .points-total-display .pts-breakdown {
    font-size: clamp(0.65rem, 1.8vw, 0.85rem);
    color: rgba(255, 255, 255, 0.5);
  }

  /* Streak Display */
  .streak-display {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 8px;
    padding: 10px 16px;
    border-radius: 12px;
    margin-bottom: 10px;
    animation: streakPulse 1.5s ease-in-out infinite;
  }

  .streak-display.hot {
    background: linear-gradient(135deg, rgba(255, 107, 0, 0.25), rgba(255, 61, 0, 0.15));
    border: 2px solid rgba(255, 107, 0, 0.5);
  }

  .streak-display.best {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.2), rgba(255, 165, 0, 0.1));
    border: 1px solid rgba(255, 215, 0, 0.4);
    animation: none;
  }

  .streak-icon {
    font-size: 1.3rem;
  }

  .streak-text {
    font-weight: bold;
    font-size: 0.95rem;
    color: #fff;
  }

  .streak-display.hot .streak-text {
    color: #ff6b00;
  }

  .streak-display.best .streak-text {
    color: #ffd700;
  }

  .streak-points {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }

  @keyframes streakPulse {
    0%, 100% { transform: scale(1); opacity: 1; }
    50% { transform: scale(1.02); opacity: 0.9; }
  }

  /* More Options Toggle */
  .more-options-toggle {
    width: 100%;
    background: rgba(255, 255, 255, 0.05);
    border: 1px dashed rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 12px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 0.85rem;
    margin-bottom: 15px;
    transition: all 0.2s;
  }

  .more-options-toggle:hover {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .more-options-section {
    animation: fadeIn 0.3s ease;
  }

  /* Court Map Styles */
  .court-container {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 10px 5px;
    margin-bottom: 10px;
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
    padding: 14px 30px;
    border: none;
    border-radius: 12px;
    font-size: 1.1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .shot-btn::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 50%;
    width: 0;
    height: 0;
    background: rgba(255, 255, 255, 0.3);
    border-radius: 50%;
    transform: translate(-50%, -50%);
    transition: width 0.4s, height 0.4s;
  }

  .shot-btn:active::after {
    width: 200px;
    height: 200px;
  }

  .shot-btn:active {
    transform: scale(0.95);
  }

  .shot-btn.made {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: #fff;
    box-shadow: 0 4px 15px rgba(46, 204, 113, 0.4);
  }

  .shot-btn.made:hover {
    background: linear-gradient(135deg, #4ade80, #2ecc71);
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px rgba(46, 204, 113, 0.5);
  }

  .shot-btn.missed {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: #fff;
    box-shadow: 0 4px 15px rgba(231, 76, 60, 0.4);
  }

  .shot-btn.missed:hover {
    background: linear-gradient(135deg, #ff6b5b, #e74c3c);
    transform: translateY(-3px) scale(1.02);
    box-shadow: 0 6px 20px rgba(231, 76, 60, 0.5);
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

  /* Court Layout - Stats | Court | Buttons */
  .court-layout {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .court-layout-full {
    display: block;
  }

  .court-layout-full .court-wrapper {
    width: 100%;
  }

  .court-layout-full .court-svg {
    max-width: 100%;
    width: 100%;
  }

  .court-action-buttons {
    display: flex;
    justify-content: center;
    gap: 10px;
    margin-top: 10px;
  }

  .court-action-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 15px;
    border-radius: 8px;
    font-size: 0.8rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .court-action-btn:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Side Stats (LEFT) */
  .court-side-stats {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 75px;
  }

  .side-stat-group {
    background: rgba(255, 255, 255, 0.08);
    padding: 12px 10px;
    border-radius: 10px;
    text-align: center;
  }

  .side-stat-label {
    font-weight: bold;
    color: #61dafb;
    font-size: 0.9rem;
    text-transform: uppercase;
    margin-bottom: 8px;
  }

  .side-stat-row {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 3px;
    font-size: 1.1rem;
    margin-bottom: 6px;
  }

  .side-made {
    color: #2ecc71;
    font-weight: bold;
    font-size: 1.2rem;
  }

  .side-sep {
    color: rgba(255, 255, 255, 0.4);
  }

  .side-total {
    color: rgba(255, 255, 255, 0.6);
  }

  .side-type {
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    margin-left: 4px;
  }

  /* Court wrapper (CENTER) */
  .court-wrapper {
    flex: 1;
  }

  /* Side Buttons (RIGHT) */
  .court-side-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
    min-width: 65px;
  }

  .court-side-btn {
    padding: 18px 14px;
    border-radius: 12px;
    border: 2px solid rgba(255, 255, 255, 0.2);
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    font-size: 1.8rem;
    cursor: pointer;
    transition: all 0.2s;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 6px;
  }

  .court-side-btn span {
    font-size: 0.85rem;
    font-weight: 500;
  }

  .court-side-btn:hover {
    transform: translateY(-2px);
  }

  .court-side-btn.history {
    color: #61dafb;
    border-color: rgba(97, 218, 251, 0.3);
  }

  .court-side-btn.history:hover {
    background: rgba(97, 218, 251, 0.15);
    border-color: #61dafb;
  }

  .court-side-btn.replay {
    color: #ff6b35;
    border-color: rgba(255, 107, 53, 0.3);
  }

  .court-side-btn.replay:hover {
    background: rgba(255, 107, 53, 0.15);
    border-color: #ff6b35;
  }

  /* Playing Time Section */
  /* Live Score Section */
  .live-score-section {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 12px;
    padding: 15px 20px;
    margin-bottom: 20px;
  }

  .live-score-section h3 {
    margin: 0 0 15px 0;
    text-align: center;
    font-size: 1rem;
    color: #61dafb;
  }

  .live-score-panel {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 20px;
  }

  .live-score-team {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 8px;
  }

  .live-score-label {
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .live-score-controls {
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .live-score-controls button {
    width: 36px;
    height: 36px;
    border-radius: 50%;
    border: none;
    background: rgba(255, 255, 255, 0.2);
    color: #fff;
    font-size: 1.2rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .live-score-controls button:hover {
    background: rgba(255, 255, 255, 0.3);
  }

  .live-score-value {
    font-size: 2rem;
    font-weight: bold;
    min-width: 50px;
    text-align: center;
  }

  .live-score-separator {
    font-size: 2rem;
    font-weight: bold;
    color: rgba(255, 255, 255, 0.5);
  }

  .plus-minus-display {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 10px;
    margin-top: 15px;
    padding: 10px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 8px;
  }

  .pm-label {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .pm-value {
    font-size: 1.5rem;
    font-weight: bold;
  }

  .plus-minus-display.positive .pm-value {
    color: #2ecc71;
  }

  .plus-minus-display.negative .pm-value {
    color: #e74c3c;
  }

  .efficiency-display {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-top: 10px;
    padding-top: 10px;
    border-top: 1px solid rgba(255, 255, 255, 0.1);
  }

  .efficiency-stat {
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 2px;
  }

  .eff-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #61dafb;
  }

  .eff-label {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.6);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

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
    padding: 12px 24px;
    border-radius: 25px;
    border: 2px solid;
    font-size: 0.95rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
    position: relative;
    overflow: hidden;
  }

  .court-toggle::before {
    content: '';
    position: absolute;
    top: 0;
    left: -100%;
    width: 100%;
    height: 100%;
    background: linear-gradient(90deg, transparent, rgba(255,255,255,0.2), transparent);
    transition: left 0.5s;
  }

  .court-toggle:hover::before {
    left: 100%;
  }

  .court-toggle.on-court {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    border-color: #2ecc71;
    color: #fff;
    box-shadow: 0 0 20px rgba(46, 204, 113, 0.5);
    animation: pulse 2s infinite;
  }

  .court-toggle.on-bench {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.7);
  }

  .court-toggle:hover {
    transform: scale(1.08);
  }

  .court-toggle:active {
    transform: scale(0.95);
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

  /* Action History Toggle Button */
  .action-history-toggle {
    display: block;
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #61dafb;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    margin-bottom: 20px;
    transition: all 0.2s;
  }

  .action-history-toggle:hover {
    background: rgba(97, 218, 251, 0.15);
    border-color: #61dafb;
    transform: translateY(-2px);
  }

  /* Action History Panel */
  .action-panel-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.7);
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .action-panel {
    position: fixed;
    top: 0;
    right: 0;
    width: 350px;
    max-width: 90%;
    height: 100%;
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border-left: 2px solid #61dafb;
    display: flex;
    flex-direction: column;
    animation: slideInRight 0.3s ease;
  }

  @keyframes slideInRight {
    from { transform: translateX(100%); }
    to { transform: translateX(0); }
  }

  .action-panel-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .action-panel-header h3 {
    color: #61dafb;
    margin: 0;
    font-size: 1.2rem;
  }

  .action-panel-close {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 2rem;
    cursor: pointer;
    padding: 0 10px;
    line-height: 1;
    transition: color 0.2s;
  }

  .action-panel-close:hover {
    color: #e74c3c;
  }

  .action-panel-actions {
    padding: 15px 20px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .undo-action-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.8);
    padding: 10px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    width: 100%;
  }

  .undo-action-btn:hover:not(:disabled) {
    background: rgba(231, 76, 60, 0.2);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .undo-action-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .action-panel-list {
    flex: 1;
    overflow-y: auto;
    padding: 15px 20px;
    display: flex;
    flex-direction: column;
    gap: 8px;
  }

  .action-item {
    display: flex;
    align-items: center;
    gap: 15px;
    padding: 10px 12px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
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

  .action-empty {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    padding: 30px;
  }

  .action-panel-hint {
    text-align: center;
    color: rgba(255, 255, 255, 0.5);
    font-size: 0.8rem;
    padding: 0 20px 10px;
    margin: 0;
  }

  .action-item.clickable {
    cursor: pointer;
    transition: background 0.2s, transform 0.1s;
  }

  .action-item.clickable:hover {
    background: rgba(255, 255, 255, 0.12);
  }

  .action-item.clickable:active {
    transform: scale(0.98);
    background: rgba(231, 76, 60, 0.2);
  }

  .action-delete-hint {
    margin-left: auto;
    opacity: 0.3;
    font-size: 0.9rem;
    transition: opacity 0.2s;
  }

  .action-item.clickable:hover .action-delete-hint {
    opacity: 0.8;
  }

  .confirm-action-detail {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin: 10px 0;
    padding: 10px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 8px;
  }

  /* Action Buttons Row */
  .action-buttons-row {
    display: flex;
    gap: 10px;
    margin-bottom: 20px;
  }

  .action-history-toggle,
  .replay-toggle {
    flex: 1;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #61dafb;
    padding: 12px 20px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    font-weight: 500;
    transition: all 0.2s;
  }

  .action-history-toggle:hover,
  .replay-toggle:hover {
    background: rgba(97, 218, 251, 0.15);
    border-color: #61dafb;
    transform: translateY(-2px);
  }

  .replay-toggle {
    color: #ff6b35;
    border-color: rgba(255, 107, 53, 0.3);
  }

  .replay-toggle:hover {
    background: rgba(255, 107, 53, 0.15);
    border-color: #ff6b35;
  }

  /* Shot Replay Styles */
  .replay-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.9);
    z-index: 2000;
    display: flex;
    align-items: center;
    justify-content: center;
    animation: fadeIn 0.3s ease;
  }

  .replay-container {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #ff6b35;
    border-radius: 20px;
    width: 95%;
    max-width: 600px;
    max-height: 95vh;
    overflow-y: auto;
    animation: scaleIn 0.3s ease;
  }

  .replay-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 20px 25px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .replay-header h2 {
    color: #ff6b35;
    margin: 0;
    font-size: 1.4rem;
  }

  .replay-close {
    background: transparent;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 2.5rem;
    cursor: pointer;
    line-height: 1;
    transition: color 0.2s;
  }

  .replay-close:hover {
    color: #e74c3c;
  }

  .replay-content {
    padding: 20px;
  }

  .replay-court-wrapper {
    position: relative;
    margin-bottom: 20px;
  }

  .replay-court {
    width: 100%;
    border-radius: 10px;
    box-shadow: 0 5px 30px rgba(0, 0, 0, 0.5);
  }

  .replay-shot-marker {
    animation: shotAppear 0.5s ease forwards;
  }

  @keyframes shotAppear {
    0% { opacity: 0; transform: scale(0); }
    50% { transform: scale(1.5); }
    100% { opacity: 1; transform: scale(1); }
  }

  .shot-pulse {
    animation: shotPulse 1s ease-out;
  }

  @keyframes shotPulse {
    0% { r: 10; opacity: 1; }
    100% { r: 30; opacity: 0; }
  }

  /* Ball animation */
  .ball-animation .basketball,
  .ball-animation .ball-shadow,
  .ball-animation .ball-lines {
    animation: ballFly 0.8s ease-out forwards;
  }

  .ball-made .basketball {
    animation: ballFlyMade 0.8s ease-out forwards;
  }

  .ball-missed .basketball {
    animation: ballFlyMissed 0.8s ease-out forwards;
  }

  @keyframes ballFly {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(
        calc((var(--end-x) - var(--start-x)) * 0.5),
        calc((var(--end-y) - var(--start-y)) * 0.5 - 50px)
      ) scale(0.8);
      opacity: 1;
    }
    100% {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y))
      ) scale(0.6);
      opacity: 0.8;
    }
  }

  @keyframes ballFlyMade {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 1;
    }
    50% {
      transform: translate(
        calc((var(--end-x) - var(--start-x)) * 0.5),
        calc((var(--end-y) - var(--start-y)) * 0.5 - 60px)
      ) scale(0.7);
      opacity: 1;
    }
    80% {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y))
      ) scale(0.5);
      opacity: 1;
    }
    100% {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y) + 30px)
      ) scale(0.4);
      opacity: 0;
    }
  }

  @keyframes ballFlyMissed {
    0% {
      transform: translate(0, 0) scale(1) rotate(0deg);
      opacity: 1;
    }
    40% {
      transform: translate(
        calc((var(--end-x) - var(--start-x)) * 0.4),
        calc((var(--end-y) - var(--start-y)) * 0.4 - 50px)
      ) scale(0.75) rotate(180deg);
      opacity: 1;
    }
    70% {
      transform: translate(
        calc((var(--end-x) - var(--start-x)) * 0.85),
        calc((var(--end-y) - var(--start-y)) * 0.7)
      ) scale(0.6) rotate(360deg);
      opacity: 1;
    }
    100% {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y) + 40px)
      ) scale(0.5) rotate(540deg);
      opacity: 0.3;
    }
  }

  .ball-animation .ball-shadow {
    animation: shadowMove 0.8s ease-out forwards;
    opacity: 0.3;
  }

  @keyframes shadowMove {
    0% {
      transform: translate(0, 0) scale(1);
      opacity: 0.3;
    }
    50% {
      transform: translate(
        calc((var(--end-x) - var(--start-x)) * 0.5),
        calc((var(--end-y) - var(--start-y)) * 0.5)
      ) scale(0.5);
      opacity: 0.15;
    }
    100% {
      transform: translate(
        calc(var(--end-x) - var(--start-x)),
        calc(var(--end-y) - var(--start-y))
      ) scale(0.8);
      opacity: 0.2;
    }
  }

  .ball-animation .ball-lines {
    animation: ballFly 0.8s ease-out forwards;
  }

  .ft-indicator {
    position: absolute;
    bottom: 20px;
    left: 50%;
    transform: translateX(-50%);
    padding: 15px 30px;
    border-radius: 30px;
    font-size: 1.2rem;
    font-weight: bold;
    animation: ftBounce 0.5s ease;
  }

  .ft-indicator.made {
    background: linear-gradient(135deg, #2ecc71, #27ae60);
    color: #fff;
    box-shadow: 0 0 30px rgba(46, 204, 113, 0.6);
  }

  .ft-indicator.missed {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
    color: #fff;
    box-shadow: 0 0 30px rgba(231, 76, 60, 0.6);
  }

  @keyframes ftBounce {
    0% { transform: translateX(-50%) scale(0); }
    50% { transform: translateX(-50%) scale(1.2); }
    100% { transform: translateX(-50%) scale(1); }
  }

  .replay-info {
    text-align: center;
    margin-bottom: 20px;
  }

  .current-action {
    background: rgba(255, 255, 255, 0.1);
    border-radius: 15px;
    padding: 20px;
    margin-bottom: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 20px;
  }

  .current-action.made {
    border: 2px solid #2ecc71;
    background: rgba(46, 204, 113, 0.1);
  }

  .current-action.missed {
    border: 2px solid #e74c3c;
    background: rgba(231, 76, 60, 0.1);
  }

  .current-action.waiting {
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  .action-quarter {
    background: #61dafb;
    color: #000;
    padding: 8px 15px;
    border-radius: 20px;
    font-weight: bold;
    font-size: 1rem;
  }

  .action-time-display {
    font-family: 'Courier New', monospace;
    font-size: 1.8rem;
    font-weight: bold;
    color: #fff;
  }

  .action-type {
    font-size: 1.2rem;
    font-weight: bold;
    color: #ff6b35;
  }

  .replay-progress {
    height: 6px;
    background: rgba(255, 255, 255, 0.1);
    border-radius: 3px;
    overflow: hidden;
    margin-bottom: 10px;
  }

  .progress-bar {
    height: 100%;
    background: linear-gradient(90deg, #ff6b35, #ff8c5a);
    border-radius: 3px;
    transition: width 0.3s ease;
  }

  .replay-counter {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
  }

  .replay-stats {
    display: flex;
    justify-content: center;
    gap: 30px;
    margin-bottom: 20px;
    padding: 15px;
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
  }

  .replay-stat {
    text-align: center;
  }

  .replay-stat .stat-label {
    display: block;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 5px;
  }

  .replay-stat .stat-value {
    font-size: 1.3rem;
    font-weight: bold;
    color: #61dafb;
  }

  .quarter-nav {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 15px;
  }

  .quarter-nav-label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
    margin-right: 5px;
  }

  .quarter-btn {
    background: rgba(97, 218, 251, 0.15);
    border: 2px solid rgba(97, 218, 251, 0.3);
    color: #61dafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    font-weight: bold;
    transition: all 0.2s;
  }

  .quarter-btn:hover:not(:disabled) {
    background: rgba(97, 218, 251, 0.3);
    border-color: #61dafb;
    transform: translateY(-2px);
  }

  .quarter-btn.active {
    background: #61dafb;
    color: #1a1a2e;
    border-color: #61dafb;
  }

  .quarter-btn.disabled,
  .quarter-btn:disabled {
    opacity: 0.3;
    cursor: not-allowed;
    border-color: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.4);
  }

  .replay-controls {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
  }

  .replay-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 12px 25px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .replay-btn:hover:not(:disabled) {
    background: rgba(255, 255, 255, 0.2);
    transform: translateY(-2px);
  }

  .replay-btn:disabled {
    opacity: 0.4;
    cursor: not-allowed;
  }

  .replay-btn.primary {
    background: linear-gradient(135deg, #ff6b35, #ff8c5a);
    border: none;
    font-weight: bold;
    min-width: 120px;
  }

  .replay-btn.primary:hover:not(:disabled) {
    background: linear-gradient(135deg, #ff8c5a, #ffaa7a);
  }

  .replay-btn.primary.playing {
    background: linear-gradient(135deg, #e74c3c, #c0392b);
  }

  .speed-control {
    display: flex;
    align-items: center;
    gap: 10px;
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .speed-control select {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 8px 12px;
    border-radius: 6px;
    cursor: pointer;
  }

  .speed-control select option {
    background: #1a1a2e;
  }

  @media (max-width: 600px) {
    .action-buttons-row {
      flex-direction: column;
    }

    .current-action {
      flex-direction: column;
      gap: 10px;
    }

    .action-time-display {
      font-size: 1.4rem;
    }

    .replay-controls {
      flex-direction: column;
    }

    .replay-btn {
      width: 100%;
    }
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

  /* Shot Charts Grid */
  .shot-charts-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(350px, 1fr));
    gap: 20px;
    margin-bottom: 20px;
  }

  /* Shot Heatmap Styles */
  .heatmap-wrapper {
    display: flex;
    justify-content: center;
    margin-bottom: 15px;
  }

  .heatmap-svg {
    width: 100%;
    max-width: 400px;
    height: auto;
    border-radius: 8px;
    box-shadow: 0 4px 15px rgba(0, 0, 0, 0.3);
  }

  .heatmap-stats {
    display: flex;
    justify-content: center;
    gap: 20px;
    margin-bottom: 15px;
  }

  .heatmap-stat {
    text-align: center;
  }

  .heatmap-stat-value {
    display: block;
    font-size: 1.2rem;
    font-weight: bold;
    color: #61dafb;
  }

  .heatmap-stat-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.6);
  }

  .heatmap-legend {
    display: flex;
    justify-content: center;
    gap: 15px;
    flex-wrap: wrap;
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.7);
  }

  .legend-item {
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .legend-color {
    width: 14px;
    height: 14px;
    border-radius: 3px;
  }

  /* Thermal Legend */
  .thermal-legend {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    font-size: 0.8rem;
  }

  .thermal-cold {
    color: #e74c3c;
    font-weight: bold;
  }

  .thermal-hot {
    color: #2ecc71;
    font-weight: bold;
  }

  .thermal-gradient {
    width: 120px;
    height: 12px;
    border-radius: 6px;
    background: linear-gradient(to right, #e74c3c, #e67e22, #f39c12, #f1c40f, #a8d86e, #2ecc71);
  }

  @media (max-width: 800px) {
    .shot-charts-grid {
      grid-template-columns: 1fr;
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

  .pin-reset-btn {
    background: transparent;
    border: 1px solid rgba(231, 76, 60, 0.5);
    color: rgba(231, 76, 60, 0.8);
    margin-top: 30px;
    padding: 10px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .pin-reset-btn:hover {
    background: rgba(231, 76, 60, 0.1);
    border-color: #e74c3c;
    color: #e74c3c;
  }

  .reset-confirm {
    text-align: center;
    padding: 20px 0;
  }

  .reset-warning {
    font-size: 1.2rem;
    font-weight: bold;
    color: #e74c3c;
    margin-bottom: 10px;
  }

  .reset-desc {
    font-size: 0.9rem;
    color: rgba(255, 255, 255, 0.6);
    margin-bottom: 25px;
  }

  .reset-buttons {
    display: flex;
    flex-direction: column;
    gap: 12px;
  }

  .reset-yes {
    background: #e74c3c;
    border: none;
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 1rem;
    font-weight: bold;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-yes:hover {
    background: #c0392b;
  }

  .reset-no {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: white;
    padding: 14px 20px;
    border-radius: 10px;
    font-size: 1rem;
    cursor: pointer;
    transition: all 0.2s;
  }

  .reset-no:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Gist Modal Styles */
  .gist-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.8);
    display: flex;
    align-items: center;
    justify-content: center;
    z-index: 1000;
    animation: fadeIn 0.2s ease;
  }

  .gist-modal {
    background: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #61dafb;
    border-radius: 16px;
    padding: 30px;
    max-width: 450px;
    width: 90%;
    animation: scaleIn 0.2s ease;
  }

  .gist-modal h3 {
    color: #61dafb;
    margin-bottom: 20px;
    text-align: center;
    font-size: 1.3rem;
  }

  .gist-modal-info {
    background: rgba(97, 218, 251, 0.1);
    border-radius: 8px;
    padding: 12px;
    margin-bottom: 20px;
    font-size: 0.85rem;
    color: rgba(255, 255, 255, 0.7);
    line-height: 1.5;
  }

  .gist-input-group {
    margin-bottom: 20px;
  }

  .gist-input-group label {
    display: block;
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 8px;
    font-size: 0.9rem;
  }

  .gist-input-group input {
    width: 100%;
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    border-radius: 8px;
    padding: 12px 15px;
    color: #fff;
    font-size: 1rem;
  }

  .gist-input-group input:focus {
    outline: none;
    border-color: #61dafb;
  }

  .gist-input-group input::placeholder {
    color: rgba(255, 255, 255, 0.4);
  }

  .gist-modal-buttons {
    display: flex;
    gap: 12px;
    justify-content: center;
  }

  .gist-btn {
    padding: 12px 25px;
    border: none;
    border-radius: 8px;
    font-size: 1rem;
    font-weight: 500;
    cursor: pointer;
    transition: all 0.2s;
  }

  .gist-btn.save {
    background: linear-gradient(135deg, #2ecc71 0%, #27ae60 100%);
    color: #fff;
  }

  .gist-btn.save:hover {
    background: linear-gradient(135deg, #3ddb80 0%, #2ecc71 100%);
    transform: translateY(-2px);
  }

  .gist-btn.cancel {
    background: rgba(255, 255, 255, 0.1);
    color: #fff;
    border: 1px solid rgba(255, 255, 255, 0.2);
  }

  .gist-btn.cancel:hover {
    background: rgba(255, 255, 255, 0.2);
  }

  /* Gist Buttons in History */
  .gist-buttons {
    display: flex;
    gap: 10px;
    margin-bottom: 10px;
  }

  .gist-action-btn {
    background: linear-gradient(135deg, rgba(97, 218, 251, 0.2) 0%, rgba(97, 218, 251, 0.1) 100%);
    border: 1px solid #61dafb;
    color: #61dafb;
    padding: 8px 16px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
    display: flex;
    align-items: center;
    gap: 8px;
  }

  .gist-action-btn:hover:not(:disabled) {
    background: linear-gradient(135deg, rgba(97, 218, 251, 0.3) 0%, rgba(97, 218, 251, 0.2) 100%);
    transform: translateY(-2px);
  }

  .gist-action-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .gist-action-btn.settings {
    background: rgba(255, 255, 255, 0.1);
    border-color: rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.8);
  }

  .gist-action-btn.settings:hover {
    border-color: #61dafb;
    color: #61dafb;
  }

  .gist-status {
    font-size: 0.8rem;
    color: rgba(255, 255, 255, 0.5);
    margin-left: auto;
  }

  .gist-status.connected {
    color: #2ecc71;
  }

  /* Gist Section */
  .gist-section {
    background: rgba(97, 218, 251, 0.1);
    border: 1px solid rgba(97, 218, 251, 0.3);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .gist-header {
    display: flex;
    justify-content: space-between;
    align-items: center;
    margin-bottom: 15px;
  }

  .gist-header h3 {
    color: #61dafb;
    margin: 0;
    font-size: 1.1rem;
  }

  .gist-settings-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.3);
    color: rgba(255, 255, 255, 0.8);
    padding: 8px 15px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.9rem;
    transition: all 0.2s;
  }

  .gist-settings-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .gist-buttons {
    display: flex;
    gap: 12px;
    flex-wrap: wrap;
    align-items: center;
  }

  /* Record Notification Modal */
  .record-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    animation: fadeIn 0.3s ease;
  }

  .record-modal {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 50%, #0f3460 100%);
    border: 3px solid #ffd700;
    border-radius: 20px;
    padding: 30px;
    max-width: 400px;
    width: 90%;
    text-align: center;
    box-shadow: 0 0 40px rgba(255, 215, 0, 0.4);
    animation: popIn 0.5s cubic-bezier(0.175, 0.885, 0.32, 1.275);
  }

  .record-modal h2 {
    color: #ffd700;
    font-size: 2rem;
    margin-bottom: 10px;
    text-shadow: 0 0 20px rgba(255, 215, 0, 0.6);
  }

  .record-trophy {
    font-size: 4rem;
    margin-bottom: 15px;
    animation: bounce 1s infinite;
  }

  .record-subtitle {
    color: rgba(255, 255, 255, 0.8);
    margin-bottom: 20px;
    font-size: 1.1rem;
  }

  .record-list {
    display: flex;
    flex-direction: column;
    gap: 12px;
    margin-bottom: 25px;
  }

  .record-item {
    background: rgba(255, 215, 0, 0.15);
    border: 1px solid rgba(255, 215, 0, 0.3);
    border-radius: 12px;
    padding: 15px;
    animation: slideIn 0.5s ease forwards;
  }

  .record-item:nth-child(2) { animation-delay: 0.1s; }
  .record-item:nth-child(3) { animation-delay: 0.2s; }
  .record-item:nth-child(4) { animation-delay: 0.3s; }
  .record-item:nth-child(5) { animation-delay: 0.4s; }
  .record-item:nth-child(6) { animation-delay: 0.5s; }

  .record-stat-name {
    color: #ffd700;
    font-weight: bold;
    font-size: 1.1rem;
    margin-bottom: 5px;
  }

  .record-values {
    display: flex;
    justify-content: center;
    align-items: center;
    gap: 15px;
    font-size: 1.2rem;
  }

  .record-old {
    color: rgba(255, 255, 255, 0.5);
    text-decoration: line-through;
  }

  .record-arrow {
    color: #2ecc71;
    font-size: 1.5rem;
  }

  .record-new {
    color: #2ecc71;
    font-weight: bold;
    font-size: 1.4rem;
    text-shadow: 0 0 10px rgba(46, 204, 113, 0.5);
  }

  .record-close-btn {
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    border: none;
    border-radius: 10px;
    padding: 12px 30px;
    font-size: 1.1rem;
    font-weight: bold;
    color: #1a1a2e;
    cursor: pointer;
    transition: all 0.3s ease;
  }

  .record-close-btn:hover {
    transform: scale(1.05);
    box-shadow: 0 5px 20px rgba(255, 215, 0, 0.4);
  }

  /* Records Section in History Page */
  .records-inline {
    background: linear-gradient(145deg, rgba(255, 215, 0, 0.1) 0%, rgba(255, 215, 0, 0.05) 100%);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 10px;
    padding: 15px;
    margin-top: 15px;
  }

  .records-inline h4 {
    color: #ffd700;
    margin-bottom: 12px;
    font-size: 1rem;
  }

  .records-grid {
    display: grid;
    grid-template-columns: repeat(auto-fit, minmax(100px, 1fr));
    gap: 12px;
  }

  .record-card {
    background: rgba(0, 0, 0, 0.3);
    border: 1px solid rgba(255, 215, 0, 0.2);
    border-radius: 10px;
    padding: 15px 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 5px;
    transition: all 0.3s ease;
  }

  .record-card:hover {
    transform: translateY(-3px);
    border-color: rgba(255, 215, 0, 0.5);
    box-shadow: 0 5px 15px rgba(255, 215, 0, 0.2);
  }

  .record-icon {
    font-size: 1.5rem;
  }

  .record-value {
    font-size: 1.8rem;
    font-weight: bold;
    color: #ffd700;
    text-shadow: 0 0 10px rgba(255, 215, 0, 0.3);
  }

  .record-label {
    font-size: 0.75rem;
    color: rgba(255, 255, 255, 0.7);
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .record-info {
    font-size: 0.65rem;
    color: rgba(255, 255, 255, 0.5);
    font-style: italic;
  }

  /* Help Button & Modal */
  .help-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 12px 15px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.3s ease;
  }

  .help-btn:hover {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .help-modal-overlay {
    position: fixed;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
    display: flex;
    justify-content: center;
    align-items: center;
    z-index: 9999;
    padding: 20px;
    animation: fadeIn 0.3s ease;
  }

  .help-modal {
    background: linear-gradient(145deg, #1a1a2e 0%, #16213e 100%);
    border: 2px solid #61dafb;
    border-radius: 15px;
    padding: 25px;
    max-width: 500px;
    width: 100%;
    max-height: 80vh;
    overflow-y: auto;
    position: relative;
    animation: popIn 0.3s ease;
  }

  .help-close {
    position: absolute;
    top: 15px;
    right: 15px;
    background: none;
    border: none;
    color: rgba(255, 255, 255, 0.6);
    font-size: 1.5rem;
    cursor: pointer;
    transition: color 0.2s;
  }

  .help-close:hover {
    color: #fff;
  }

  .help-modal h2 {
    color: #61dafb;
    margin-bottom: 20px;
    font-size: 1.4rem;
  }

  .help-section {
    margin-bottom: 20px;
    padding-bottom: 15px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  .help-section:last-child {
    border-bottom: none;
    margin-bottom: 0;
  }

  .help-section h3 {
    color: #fff;
    font-size: 1rem;
    margin-bottom: 10px;
  }

  .help-item {
    display: flex;
    gap: 10px;
    margin-bottom: 8px;
    align-items: flex-start;
  }

  .help-term {
    background: rgba(97, 218, 251, 0.2);
    color: #61dafb;
    padding: 2px 8px;
    border-radius: 4px;
    font-weight: bold;
    font-size: 0.8rem;
    min-width: 45px;
    text-align: center;
    flex-shrink: 0;
  }

  .help-def {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.85rem;
    line-height: 1.4;
  }

  .help-text {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.85rem;
    line-height: 1.5;
    margin: 0;
  }

  /* Analysis Page */
  .analysis-page {
    animation: fadeIn 0.3s ease;
  }

  .analysis-page h2 {
    color: #61dafb;
    margin-bottom: 20px;
    text-align: center;
  }

  .analysis-filter {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 10px;
    padding: 15px;
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    gap: 10px;
  }

  .analysis-filter label {
    color: rgba(255, 255, 255, 0.7);
    font-size: 0.9rem;
  }

  .analysis-section {
    margin-bottom: 25px;
  }

  .analysis-section h3 {
    color: rgba(255, 255, 255, 0.9);
    margin-bottom: 15px;
    font-size: 1.1rem;
    padding-bottom: 8px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.1);
  }

  /* Advanced Stats Grid */
  .advanced-stats-grid {
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    gap: 12px;
  }

  .advanced-stat {
    background: rgba(255, 255, 255, 0.08);
    border-radius: 12px;
    padding: 15px 10px;
    text-align: center;
    display: flex;
    flex-direction: column;
    gap: 4px;
    transition: all 0.2s;
  }

  .advanced-stat:hover {
    background: rgba(255, 255, 255, 0.12);
    transform: translateY(-2px);
  }

  .advanced-stat.positive {
    background: rgba(46, 204, 113, 0.15);
    border: 1px solid rgba(46, 204, 113, 0.3);
  }

  .advanced-stat.negative {
    background: rgba(231, 76, 60, 0.15);
    border: 1px solid rgba(231, 76, 60, 0.3);
  }

  .adv-value {
    font-size: 1.5rem;
    font-weight: bold;
    color: #61dafb;
  }

  .advanced-stat.positive .adv-value {
    color: #2ecc71;
  }

  .advanced-stat.negative .adv-value {
    color: #e74c3c;
  }

  .adv-label {
    font-size: 0.85rem;
    font-weight: 600;
    color: rgba(255, 255, 255, 0.9);
  }

  .adv-desc {
    font-size: 0.7rem;
    color: rgba(255, 255, 255, 0.5);
  }

  .advanced-stat.streak {
    background: linear-gradient(135deg, rgba(255, 107, 0, 0.2), rgba(255, 61, 0, 0.1));
    border: 1px solid rgba(255, 107, 0, 0.4);
  }

  .advanced-stat.streak .adv-value {
    color: #ff6b00;
  }

  .no-data-message {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 40px 20px;
    text-align: center;
    color: rgba(255, 255, 255, 0.6);
  }

  .no-data-message p {
    margin-bottom: 10px;
  }

  .no-data-message p:last-child {
    margin-bottom: 0;
    font-size: 0.9rem;
  }

  /* Options Page */
  .options-page {
    animation: fadeIn 0.3s ease;
  }

  .options-page h2 {
    color: #61dafb;
    margin-bottom: 25px;
    text-align: center;
  }

  .options-section {
    background: rgba(255, 255, 255, 0.05);
    border-radius: 12px;
    padding: 20px;
    margin-bottom: 20px;
  }

  .options-section h3 {
    color: #fff;
    margin-bottom: 10px;
    font-size: 1.1rem;
  }

  .options-description {
    color: rgba(255, 255, 255, 0.6);
    font-size: 0.9rem;
    margin-bottom: 15px;
  }

  .theme-toggle {
    display: flex;
    gap: 10px;
  }

  .theme-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 2px solid rgba(255, 255, 255, 0.2);
    color: rgba(255, 255, 255, 0.7);
    padding: 12px 24px;
    border-radius: 10px;
    cursor: pointer;
    font-size: 1rem;
    transition: all 0.2s;
  }

  .theme-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .theme-btn.active {
    background: rgba(97, 218, 251, 0.2);
    border-color: #61dafb;
    color: #61dafb;
  }

  .gist-config {
    margin-bottom: 15px;
  }

  .gist-status-line {
    display: flex;
    align-items: center;
    gap: 15px;
  }

  .gist-config-btn {
    background: rgba(97, 218, 251, 0.2);
    border: 1px solid #61dafb;
    color: #61dafb;
    padding: 8px 16px;
    border-radius: 6px;
    cursor: pointer;
    font-size: 0.85rem;
    transition: all 0.2s;
  }

  .gist-config-btn:hover {
    background: rgba(97, 218, 251, 0.3);
  }

  .gist-actions {
    display: flex;
    gap: 10px;
    flex-wrap: wrap;
  }

  .options-actions {
    display: flex;
    flex-direction: column;
    gap: 10px;
  }

  .options-btn {
    background: rgba(255, 255, 255, 0.1);
    border: 1px solid rgba(255, 255, 255, 0.2);
    color: #fff;
    padding: 12px 20px;
    border-radius: 8px;
    cursor: pointer;
    font-size: 0.95rem;
    transition: all 0.2s;
    text-align: left;
  }

  .options-btn:hover {
    background: rgba(255, 255, 255, 0.15);
    border-color: rgba(255, 255, 255, 0.3);
  }

  .options-btn.danger {
    border-color: rgba(231, 76, 60, 0.3);
    color: #e74c3c;
  }

  .options-btn.danger:hover {
    background: rgba(231, 76, 60, 0.1);
    border-color: #e74c3c;
  }

  /* Record highlight in match list */
  .match-card.has-record {
    border-left: 3px solid #ffd700;
  }

  .match-card.has-record .record-badge {
    display: inline-block;
    background: linear-gradient(135deg, #ffd700 0%, #ffaa00 100%);
    color: #1a1a2e;
    font-size: 0.65rem;
    padding: 2px 6px;
    border-radius: 4px;
    margin-left: 8px;
    font-weight: bold;
  }

  /* Light Theme */
  body[data-theme="light"] {
    background: linear-gradient(135deg, #f5f7fa 0%, #e4e8ec 100%);
    color: #1a1a2e;
  }

  [data-theme="light"] .container {
    color: #1a1a2e;
  }

  [data-theme="light"] h1 {
    color: #ff6b35;
  }

  [data-theme="light"] .nav-tab {
    background: rgba(0, 0, 0, 0.08);
    color: #1a1a2e;
  }

  [data-theme="light"] .nav-tab:hover {
    background: rgba(0, 0, 0, 0.1);
    color: #1a1a2e;
  }

  [data-theme="light"] .nav-tab.active {
    background: rgba(26, 74, 143, 0.15);
    border-color: #1a4a8f;
    color: #1a4a8f;
    box-shadow: 0 0 10px rgba(26, 74, 143, 0.3);
  }

  [data-theme="light"] .stat-card,
  [data-theme="light"] .player-info,
  [data-theme="light"] .timer-section,
  [data-theme="light"] .save-section,
  [data-theme="light"] .options-section,
  [data-theme="light"] .analysis-filter,
  [data-theme="light"] .detailed-stats-section,
  [data-theme="light"] .chart-container,
  [data-theme="light"] .quarter-stats-section,
  [data-theme="light"] .playing-time-section {
    background: rgba(255, 255, 255, 0.8);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .stat-card h3,
  [data-theme="light"] h2,
  [data-theme="light"] h3 {
    color: #1a1a2e;
  }

  [data-theme="light"] .counter-btn {
    background: rgba(0, 0, 0, 0.08);
    color: #1a1a2e;
  }

  [data-theme="light"] .counter-btn:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  [data-theme="light"] .counter-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .player-info input,
  [data-theme="light"] .opponent-input,
  [data-theme="light"] .match-notes-input {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a2e;
  }

  [data-theme="light"] .player-info input::placeholder,
  [data-theme="light"] .opponent-input::placeholder,
  [data-theme="light"] .match-notes-input::placeholder {
    color: #555;
  }

  [data-theme="light"] .timer-display {
    color: #1a4a8f;
  }

  [data-theme="light"] .time-compact {
    color: #1a1a2e;
  }

  [data-theme="light"] .time-compact.running {
    color: #27ae60;
  }

  [data-theme="light"] .quarter-compact {
    background: rgba(26, 74, 143, 0.15);
    color: #1a4a8f;
  }

  [data-theme="light"] .score-label {
    color: #2a2a2a;
  }

  [data-theme="light"] .score-value {
    color: #1a1a2e;
  }

  [data-theme="light"] .player-name-compact {
    color: #1a1a2e;
  }

  [data-theme="light"] .player-number-compact {
    color: #1a4a8f;
  }

  [data-theme="light"] .timer-btn,
  [data-theme="light"] .action-btn {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a2e;
  }

  [data-theme="light"] .timer-btn:hover,
  [data-theme="light"] .action-btn:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  [data-theme="light"] .live-score-section {
    background: rgba(26, 74, 143, 0.1);
    border-color: rgba(26, 74, 143, 0.3);
  }

  [data-theme="light"] .live-score-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .score-inputs.auto-score {
    background: rgba(26, 74, 143, 0.1);
    border-color: rgba(26, 74, 143, 0.3);
  }

  [data-theme="light"] .auto-score-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .match-card {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .match-card:hover {
    background: rgba(255, 255, 255, 1);
  }

  [data-theme="light"] .match-date,
  [data-theme="light"] .match-opponent {
    color: #1a1a2e;
  }

  [data-theme="light"] .stat-val {
    color: #1a4a8f;
  }

  [data-theme="light"] .ds-value {
    color: #1a1a2e;
  }

  [data-theme="light"] .ds-label,
  [data-theme="light"] .stat-name {
    color: #2a2a2a;
  }

  [data-theme="light"] .options-description,
  [data-theme="light"] .history-filter label,
  [data-theme="light"] .analysis-filter label {
    color: #2a2a2a;
  }

  [data-theme="light"] .match-select {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a2e;
  }

  [data-theme="light"] .theme-btn {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.25);
    color: #1a1a2e;
  }

  [data-theme="light"] .theme-btn:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .theme-btn.active {
    background: rgba(26, 74, 143, 0.15);
    border-color: #1a4a8f;
    color: #1a4a8f;
  }

  [data-theme="light"] .court-toggle.on-court {
    background: linear-gradient(135deg, #27ae60, #2ecc71);
  }

  [data-theme="light"] .gist-action-btn {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a2e;
  }

  [data-theme="light"] .edit-btn {
    color: #666;
  }

  [data-theme="light"] .edit-btn:hover {
    color: #1a4a8f;
  }

  [data-theme="light"] .delete-btn {
    color: #444;
  }

  [data-theme="light"] .delete-btn:hover {
    color: #e74c3c;
  }

  /* Light theme - Additional fixes for contrast */
  [data-theme="light"] .quick-stats-section,
  [data-theme="light"] .more-options-section,
  [data-theme="light"] .action-history-panel,
  [data-theme="light"] .analysis-section,
  [data-theme="light"] .summary {
    background: rgba(255, 255, 255, 0.9);
    box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
    border-radius: 12px;
  }

  [data-theme="light"] .stats-category-title {
    color: #1a4a8f;
    border-color: rgba(26, 74, 143, 0.3);
  }

  [data-theme="light"] .quick-stat-box {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .qs-label {
    color: #1a1a2e;
  }

  [data-theme="light"] .qs-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .qs-btn {
    background: rgba(0, 0, 0, 0.08);
    color: #1a1a2e;
  }

  [data-theme="light"] .qs-btn:hover {
    background: rgba(0, 0, 0, 0.15);
  }

  [data-theme="light"] .points-total-display {
    background: rgba(26, 74, 143, 0.1);
    border-color: rgba(26, 74, 143, 0.3);
  }

  [data-theme="light"] .pts-label,
  [data-theme="light"] .pts-breakdown {
    color: #2a2a2a;
  }

  [data-theme="light"] .pts-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .streak-display.hot {
    background: linear-gradient(135deg, rgba(255, 107, 0, 0.15), rgba(255, 61, 0, 0.1));
    border-color: rgba(255, 107, 0, 0.4);
  }

  [data-theme="light"] .streak-display.best {
    background: linear-gradient(135deg, rgba(255, 215, 0, 0.15), rgba(255, 165, 0, 0.1));
  }

  [data-theme="light"] .streak-text {
    color: #1a1a2e;
  }

  [data-theme="light"] .streak-points {
    color: #2a2a2a;
  }

  [data-theme="light"] .more-options-toggle {
    background: rgba(0, 0, 0, 0.06);
    border-color: rgba(0, 0, 0, 0.3);
    color: #1a1a2e;
  }

  [data-theme="light"] .more-options-toggle:hover {
    background: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .quarter-display {
    color: #1a4a8f;
  }

  [data-theme="light"] .time-adjust-btn {
    background: rgba(0, 0, 0, 0.08);
    border-color: rgba(0, 0, 0, 0.15);
    color: #1a1a2e;
  }

  [data-theme="light"] .time-adjust-btn:hover {
    background: rgba(26, 74, 143, 0.15);
    border-color: #1a4a8f;
    color: #1a4a8f;
  }

  [data-theme="light"] .action-history-panel {
    background: rgba(255, 255, 255, 0.95);
  }

  [data-theme="light"] .action-history-panel h4 {
    color: #1a1a2e;
    border-color: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .action-item {
    background: rgba(0, 0, 0, 0.03);
    color: #1a1a2e;
  }

  [data-theme="light"] .action-item:hover {
    background: rgba(231, 76, 60, 0.1);
  }

  [data-theme="light"] .action-time {
    color: #333;
  }

  [data-theme="light"] .advanced-stats-grid {
    background: transparent;
  }

  [data-theme="light"] .advanced-stat {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .advanced-stat:hover {
    background: rgba(0, 0, 0, 0.08);
  }

  [data-theme="light"] .advanced-stat.positive {
    background: rgba(46, 204, 113, 0.1);
    border-color: rgba(46, 204, 113, 0.3);
  }

  [data-theme="light"] .advanced-stat.negative {
    background: rgba(231, 76, 60, 0.1);
    border-color: rgba(231, 76, 60, 0.3);
  }

  [data-theme="light"] .advanced-stat.streak {
    background: linear-gradient(135deg, rgba(255, 107, 0, 0.1), rgba(255, 61, 0, 0.05));
    border-color: rgba(255, 107, 0, 0.3);
  }

  [data-theme="light"] .adv-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .advanced-stat.positive .adv-value {
    color: #27ae60;
  }

  [data-theme="light"] .advanced-stat.negative .adv-value {
    color: #e74c3c;
  }

  [data-theme="light"] .advanced-stat.streak .adv-value {
    color: #e67e22;
  }

  [data-theme="light"] .adv-label {
    color: #1a1a2e;
  }

  [data-theme="light"] .adv-desc {
    color: #333;
  }

  [data-theme="light"] .shooting-stats {
    background: rgba(0, 0, 0, 0.03);
  }

  [data-theme="light"] .shooting-stats h4 {
    color: #1a1a2e;
  }

  [data-theme="light"] .shooting-label {
    color: #2a2a2a;
  }

  [data-theme="light"] .shooting-value {
    color: #1a1a2e;
  }

  [data-theme="light"] .shooting-pct {
    color: #333;
  }

  [data-theme="light"] .averages-inline,
  [data-theme="light"] .records-inline {
    background: rgba(0, 0, 0, 0.03);
  }

  [data-theme="light"] .averages-inline h4,
  [data-theme="light"] .records-inline h4 {
    color: #1a1a2e;
  }

  [data-theme="light"] .averages-inline-grid span {
    color: #1a4a8f;
  }

  [data-theme="light"] .compare-view {
    background: rgba(0, 0, 0, 0.03);
  }

  [data-theme="light"] .compare-view h3 {
    color: #1a1a2e;
  }

  [data-theme="light"] .compare-header {
    border-bottom-color: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .compare-team {
    color: #1a1a2e;
  }

  [data-theme="light"] .compare-vs {
    color: #999;
  }

  [data-theme="light"] .compare-row {
    border-bottom-color: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .compare-val {
    color: #333;
  }

  [data-theme="light"] .compare-label {
    color: #777;
  }

  [data-theme="light"] .compare-section label {
    color: #555;
  }

  [data-theme="light"] .match-playtime {
    color: #666;
  }

  [data-theme="light"] .rolling-averages {
    border-top-color: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .rolling-averages h5 {
    color: rgba(26, 26, 46, 0.7);
  }

  [data-theme="light"] .quarter-stats-display,
  [data-theme="light"] .playing-time-display {
    background: rgba(0, 0, 0, 0.03);
  }

  [data-theme="light"] .quarter-stats-display h4,
  [data-theme="light"] .playing-time-display h4 {
    color: #1a1a2e;
  }

  [data-theme="light"] .quarter-stat-card {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .qs-quarter {
    color: #1a4a8f;
  }

  [data-theme="light"] .qs-points {
    color: #1a1a2e;
  }

  [data-theme="light"] .qs-detail {
    color: #555;
  }

  [data-theme="light"] .pt-value {
    color: #1a1a2e;
  }

  [data-theme="light"] .pt-label {
    color: #555;
  }

  [data-theme="light"] .goals-section {
    background: rgba(0, 0, 0, 0.03);
  }

  [data-theme="light"] .goals-section h4 {
    color: #1a1a2e;
  }

  [data-theme="light"] .goal-label {
    color: #555;
  }

  [data-theme="light"] .goal-values {
    color: #1a1a2e;
  }

  [data-theme="light"] .goal-bar {
    background: rgba(0, 0, 0, 0.1);
  }

  [data-theme="light"] .goal-input label {
    color: #555;
  }

  [data-theme="light"] .goal-input input {
    background: rgba(0, 0, 0, 0.05);
    border-color: rgba(0, 0, 0, 0.2);
    color: #1a1a2e;
  }

  [data-theme="light"] .record-card {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .record-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .record-label {
    color: #1a1a2e;
  }

  [data-theme="light"] .record-info {
    color: #333;
  }

  [data-theme="light"] .no-data-message {
    background: rgba(0, 0, 0, 0.05);
    color: #2a2a2a;
  }

  [data-theme="light"] .summary {
    color: #1a1a2e;
  }

  [data-theme="light"] .summary-value {
    color: #1a4a8f;
  }

  [data-theme="light"] .summary-label {
    color: #2a2a2a;
  }

  [data-theme="light"] .duration-selector {
    background: rgba(0, 0, 0, 0.05);
  }

  [data-theme="light"] .duration-selector p {
    color: #1a1a2e;
  }

  [data-theme="light"] .duration-btn {
    background: rgba(0, 0, 0, 0.08);
    color: #1a1a2e;
  }

  [data-theme="light"] .duration-btn.active {
    background: #1a4a8f;
    color: white;
  }

  [data-theme="light"] .settings-btn {
    color: #2a2a2a;
  }

  [data-theme="light"] .settings-btn:hover,
  [data-theme="light"] .settings-btn.active {
    color: #1a4a8f;
    background: rgba(26, 74, 143, 0.1);
  }

  [data-theme="light"] .confirm-overlay {
    background: rgba(0, 0, 0, 0.6);
  }

  [data-theme="light"] .confirm-modal {
    background: #fff;
    color: #1a1a2e;
  }

  [data-theme="light"] .confirm-warning {
    color: #2a2a2a;
  }

  /* ========== MOBILE RESPONSIVE STYLES ========== */

  /* Viewport meta handling */
  @media screen and (max-width: 480px) {
    body {
      padding: 5px;
      font-size: 14px;
    }

    .container {
      padding: 0;
    }

    .match-header-compact,
    .court-container,
    .quick-stats-grid,
    .points-total-display,
    .more-options-toggle {
      margin-left: 0;
      margin-right: 0;
    }

    h1 {
      font-size: 1.3rem;
      margin-bottom: 15px;
    }

    .badge {
      font-size: 0.6rem;
      padding: 2px 6px;
    }

    /* Navigation Tabs */
    .nav-tabs {
      gap: 5px;
      flex-wrap: wrap;
      margin-bottom: 15px;
    }

    .nav-tab {
      padding: 8px 12px;
      font-size: 0.8rem;
      flex: 1;
      min-width: 80px;
      text-align: center;
    }

    /* Player Info */
    .player-info {
      padding: 12px;
      gap: 10px;
      margin-bottom: 15px;
    }

    .player-info input {
      min-width: 100%;
      padding: 8px 12px;
      font-size: 0.9rem;
    }

    /* Timer Section */
    .timer-section {
      padding: 12px;
      margin-bottom: 15px;
    }

    .timer-header {
      flex-wrap: wrap;
      gap: 8px;
    }

    .timer-display {
      font-size: 2.5rem !important;
    }

    .quarter-display {
      font-size: 0.85rem;
    }

    .timer-controls {
      gap: 6px;
    }

    /* Timer buttons reorganization for mobile */
    .timer-buttons {
      display: grid !important;
      grid-template-columns: 1fr 1fr;
      gap: 10px;
      width: 100%;
    }

    .timer-btn {
      padding: 14px 10px;
      font-size: 0.85rem;
      white-space: nowrap;
      text-align: center;
    }

    .timer-btn.primary {
      grid-column: span 2;
      padding: 16px;
      font-size: 1.1rem;
    }

    .timer-btn.quarter-nav {
      font-size: 0.8rem;
      padding: 12px 10px;
    }

    /* Time adjust buttons - tous sur une ligne */
    .timer-display-wrapper {
      flex-direction: row;
      gap: 8px;
      flex-wrap: nowrap;
    }

    .time-adjust-group {
      display: flex;
      flex-direction: row;
      gap: 4px;
    }

    .time-adjust-btn {
      padding: 6px 10px;
      font-size: 0.75rem;
      min-width: 40px;
    }

    .timer-display {
      font-size: 2.2rem;
    }

    /* Stats Grid */
    .stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px;
    }

    .stat-card {
      padding: 10px;
    }

    .stat-label {
      font-size: 0.7rem;
    }

    .stat-value {
      font-size: 1.3rem;
    }

    .stat-buttons {
      gap: 5px;
      margin-top: 8px;
    }

    .stat-btn {
      width: 32px;
      height: 32px;
      font-size: 1rem;
    }

    /* Summary Section */
    .summary-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 10px;
    }

    .summary-card {
      padding: 12px;
    }

    .summary-value {
      font-size: 1.3rem !important;
    }

    .summary-label {
      font-size: 0.7rem;
    }

    /* Court Map */
    .court-container {
      padding: 10px;
      margin-bottom: 15px;
    }

    .court-header {
      flex-direction: column;
      gap: 10px;
      align-items: flex-start;
    }

    .court-header h3 {
      font-size: 1rem;
    }

    .court-svg {
      max-width: 100%;
    }

    .shot-modal {
      min-width: 200px;
      padding: 15px;
      width: 90%;
    }

    .shot-type-badge {
      font-size: 1rem;
      padding: 6px 15px;
    }

    .shot-modal p {
      font-size: 0.95rem;
    }

    .shot-modal-buttons {
      gap: 10px;
    }

    .shot-btn {
      padding: 10px 20px;
      font-size: 0.9rem;
    }

    /* Detailed Stats */
    .detailed-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px;
    }

    .detailed-stat {
      padding: 10px;
    }

    .detailed-stat.big {
      grid-column: span 2;
    }

    .detailed-stat-value {
      font-size: 1.2rem;
    }

    .detailed-stat-label {
      font-size: 0.65rem;
    }

    /* Shooting Stats */
    .shooting-grid {
      grid-template-columns: 1fr !important;
      gap: 8px;
    }

    .shooting-card {
      padding: 12px;
    }

    /* Playing Time */
    .playing-time-section {
      padding: 12px;
    }

    .court-toggle {
      padding: 10px 20px;
      font-size: 0.9rem;
    }

    .playing-time-display {
      flex-direction: column !important;
      gap: 10px;
      align-items: stretch !important;
    }

    .time-stat {
      text-align: center;
    }

    .per-minute-stats {
      flex-wrap: wrap;
      justify-content: center !important;
      gap: 8px;
      margin-left: 0 !important;
    }

    .per-minute-stat {
      font-size: 0.75rem;
    }

    /* Quarter Stats */
    .quarter-stats-grid {
      grid-template-columns: repeat(2, 1fr) !important;
      gap: 8px;
    }

    .quarter-stat-card {
      padding: 10px;
    }

    /* Action History */
    .action-panel {
      padding: 12px;
    }

    .action-list {
      max-height: 200px;
    }

    .action-item {
      padding: 8px;
      font-size: 0.8rem;
    }

    /* Match History */
    .history-section {
      padding: 12px;
    }

    .match-card {
      padding: 12px;
    }

    .match-header {
      flex-direction: column;
      gap: 8px;
      align-items: flex-start;
    }

    .match-stats-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    /* Charts */
    .charts-grid {
      grid-template-columns: 1fr !important;
    }

    .chart-container {
      padding: 12px;
    }

    /* Shot Charts */
    .shot-charts-grid {
      grid-template-columns: 1fr !important;
      gap: 15px;
    }

    .heatmap-stats {
      gap: 10px;
      flex-wrap: wrap;
    }

    /* Gist Section */
    .gist-section {
      padding: 12px;
    }

    .gist-modal {
      width: 95%;
      padding: 15px;
    }

    .gist-input-group input {
      font-size: 0.9rem;
    }

    .gist-actions {
      flex-direction: column;
      gap: 8px;
    }

    .gist-action-btn {
      width: 100%;
      padding: 12px;
    }

    /* Buttons general */
    .btn, button {
      -webkit-tap-highlight-color: transparent;
      touch-action: manipulation;
    }

    /* Live Score */
    .live-score-section {
      padding: 12px;
    }

    .live-score-display {
      font-size: 1.5rem;
    }

    /* Options/Settings */
    .options-card {
      padding: 12px;
    }

    .theme-selector {
      flex-wrap: wrap;
      gap: 8px;
    }

    .theme-btn {
      flex: 1;
      min-width: 80px;
      padding: 8px 12px;
      font-size: 0.8rem;
    }

    /* Analysis Tab */
    .analysis-section {
      padding: 12px;
    }

    .analysis-filter {
      flex-direction: column;
      gap: 10px;
    }

    .match-select {
      width: 100%;
    }

    /* Advanced Stats Grid Mobile */
    .advanced-stats-grid {
      grid-template-columns: repeat(3, 1fr);
      gap: 8px;
    }

    .advanced-stat {
      padding: 10px 6px;
    }

    .adv-value {
      font-size: 1.2rem;
    }

    .adv-label {
      font-size: 0.75rem;
    }

    .adv-desc {
      font-size: 0.6rem;
    }

    /* Modals */
    .modal-overlay {
      padding: 10px;
    }

    .modal-content {
      width: 95%;
      max-height: 90vh;
      padding: 15px;
    }

    /* Help Modal */
    .help-modal {
      width: 95%;
      padding: 15px;
    }

    /* Record Notification */
    .record-notification {
      width: 95%;
      padding: 15px;
    }
  }

  /* Tablet adjustments */
  @media screen and (min-width: 481px) and (max-width: 768px) {
    body {
      padding: 15px;
    }

    .nav-tab {
      padding: 10px 18px;
      font-size: 0.9rem;
    }

    .stats-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .summary-grid {
      grid-template-columns: repeat(3, 1fr);
    }

    .detailed-stats-grid {
      grid-template-columns: repeat(4, 1fr);
    }
  }

  /* Ensure touch targets are large enough */
  @media (pointer: coarse) {
    .stat-btn,
    .timer-btn,
    .nav-tab,
    .shot-btn,
    .gist-action-btn,
    .theme-btn,
    button {
      min-height: 44px;
      min-width: 44px;
    }
  }

  /* Safe area for notched phones */
  @supports (padding: max(0px)) {
    body {
      padding-left: max(10px, env(safe-area-inset-left));
      padding-right: max(10px, env(safe-area-inset-right));
      padding-bottom: max(10px, env(safe-area-inset-bottom));
    }
  }
`

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(true)
  const [activeTab, setActiveTab] = useState('match')
  const [opponent, setOpponent] = useState(() => localStorage.getItem('basketOpponent') || '')
  const [matchLocation, setMatchLocation] = useState(() => localStorage.getItem('basketMatchLocation') || 'home')
  const [liveScoreTeam, setLiveScoreTeam] = useState(() => {
    const saved = localStorage.getItem('basketLiveScoreTeam')
    return saved ? parseInt(saved) : 0
  })
  const [liveScoreOpponent, setLiveScoreOpponent] = useState(() => {
    const saved = localStorage.getItem('basketLiveScoreOpponent')
    return saved ? parseInt(saved) : 0
  })
  const [plusMinus, setPlusMinus] = useState(() => {
    const saved = localStorage.getItem('basketPlusMinus')
    return saved ? parseInt(saved) : 0
  })
  const [lastPlusMinusScore, setLastPlusMinusScore] = useState(() => {
    const saved = localStorage.getItem('basketLastPlusMinusScore')
    return saved ? JSON.parse(saved) : { team: 0, opponent: 0 }
  })
  const [shotMarkers, setShotMarkers] = useState(() => {
    const saved = localStorage.getItem('basketShotMarkers')
    return saved ? JSON.parse(saved) : []
  })
  const [matchNotes, setMatchNotes] = useState(() => {
    const saved = localStorage.getItem('basketMatchNotes')
    return saved ? JSON.parse(saved) : { strengths: '', improvements: '' }
  })
  const [theme, setTheme] = useState(() => localStorage.getItem('basketTheme') || 'dark')
  const [githubToken, setGithubToken] = useState(() => {
    const saved = localStorage.getItem('basketGithubToken')
    return saved ? atob(saved) : ''
  })
  const [gistId, setGistId] = useState(() => localStorage.getItem('basketGistId') || '')
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('basketGoals')
    return saved ? JSON.parse(saved) : { points: '', rebounds: '', assists: '' }
  })
  const [showGistSettings, setShowGistSettings] = useState(false)
  const [gistLoading, setGistLoading] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [showActionPanel, setShowActionPanel] = useState(false)
  const [trainingMarkers, setTrainingMarkers] = useState([])
  const [trainingStats, setTrainingStats] = useState({ fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0 })
  const [actionToDelete, setActionToDelete] = useState(null) // Action pending deletion confirmation
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [showReplay, setShowReplay] = useState(false)
  const [recordNotification, setRecordNotification] = useState(null) // { records: [...] }
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [analysisSelectedMatchId, setAnalysisSelectedMatchId] = useState('all')



  const { stats, updateStat, resetStats, importStats, getSummary, getEfficiency, getStreaks, actionHistory, getStatsByQuarter, undoLastAction, deleteAction } = useStats()
  const { player, updatePlayer } = usePlayer()
  const timer = useTimer()
  const { history, saveMatch, deleteMatch, updateMatchOpponent, updateMatchScore, updateMatchPhoto, clearHistory, importHistory, getAverages, getRecentAverages, getRecords, checkNewRecords } = useMatchHistory()
  const playingTime = usePlayingTime()

  const summary = getSummary()
  const averages = getAverages()
  const quarterStats = getStatsByQuarter()
  const efficiency = getEfficiency()
  const streaks = getStreaks()

  // Track playing time when timer is running
  useEffect(() => {
    return playingTime.trackTime(timer.isRunning)
  }, [timer.isRunning, playingTime.isOnCourt])

  // Save shot markers to localStorage
  useEffect(() => {
    localStorage.setItem('basketShotMarkers', JSON.stringify(shotMarkers))
  }, [shotMarkers])

  // Save live score and match data to localStorage
  useEffect(() => {
    localStorage.setItem('basketLiveScoreTeam', liveScoreTeam.toString())
  }, [liveScoreTeam])

  useEffect(() => {
    localStorage.setItem('basketLiveScoreOpponent', liveScoreOpponent.toString())
  }, [liveScoreOpponent])

  useEffect(() => {
    localStorage.setItem('basketPlusMinus', plusMinus.toString())
  }, [plusMinus])

  useEffect(() => {
    localStorage.setItem('basketLastPlusMinusScore', JSON.stringify(lastPlusMinusScore))
  }, [lastPlusMinusScore])

  useEffect(() => {
    localStorage.setItem('basketOpponent', opponent)
  }, [opponent])

  useEffect(() => {
    localStorage.setItem('basketMatchLocation', matchLocation)
  }, [matchLocation])

  useEffect(() => {
    localStorage.setItem('basketMatchNotes', JSON.stringify(matchNotes))
  }, [matchNotes])

  useEffect(() => {
    localStorage.setItem('basketTheme', theme)
    document.body.setAttribute('data-theme', theme)
  }, [theme])

  useEffect(() => {
    localStorage.setItem('basketGoals', JSON.stringify(goals))
  }, [goals])

  // Calculate +/- when player is on court and score changes
  useEffect(() => {
    if (playingTime.isOnCourt) {
      const teamDiff = liveScoreTeam - lastPlusMinusScore.team
      const oppDiff = liveScoreOpponent - lastPlusMinusScore.opponent
      const diff = teamDiff - oppDiff
      if (diff !== 0) {
        setPlusMinus(prev => prev + diff)
      }
    }
    setLastPlusMinusScore({ team: liveScoreTeam, opponent: liveScoreOpponent })
  }, [liveScoreTeam, liveScoreOpponent])

  // Helper to update stat with current time
  const updateStatWithTime = (statName, delta, silent = false) => {
    updateStat(statName, delta, timer.quarter, timer.timeLeft, silent)
  }

  // Shot management: made shots automatically count as attempted
  const handleShotMadeIncrement = (madeKey, attemptedKey, points = 0) => {
    updateStatWithTime(madeKey, 1)  // Record in history: "2PTS réussi"
    updateStatWithTime(attemptedKey, 1, true)  // Silent: don't record attempted
    // Auto-add points to live score
    if (points > 0) {
      setLiveScoreTeam(prev => prev + points)
    }
  }

  const handleShotMadeDecrement = (madeKey, attemptedKey, points = 0) => {
    // Decrement made = convert a made shot to a miss
    if (stats[madeKey] > 0) {
      updateStatWithTime(madeKey, -1)  // Remove "réussi" from history
      // attempted stays the same (shot becomes a miss)
      // Remove points from live score
      if (points > 0) {
        setLiveScoreTeam(prev => Math.max(0, prev - points))
      }
    }
  }

  const handleShotAttemptedIncrement = (attemptedKey) => {
    // This is called for missed shots
    updateStatWithTime(attemptedKey, 1)  // Record in history: "2PTS raté"
  }

  // Free throw specific handlers - add markers to court map
  const FT_POSITION = { x: 250, y: 190 } // Free throw line position

  const handleFreeThrowMadeIncrement = () => {
    handleShotMadeIncrement('ftMade', 'ftAttempted', 1)
    // Add marker on court map
    const marker = {
      id: Date.now(),
      x: FT_POSITION.x + (Math.random() - 0.5) * 20, // Slight random offset
      y: FT_POSITION.y + (Math.random() - 0.5) * 10,
      made: true,
      isThreePointer: false,
      isFreeThrow: true,
      quarter: timer.quarter
    }
    setShotMarkers(prev => [...prev, marker])
  }

  const handleFreeThrowMadeDecrement = () => {
    handleShotMadeDecrement('ftMade', 'ftAttempted', 1)
    // Remove last FT made marker
    setShotMarkers(prev => {
      const idx = [...prev].reverse().findIndex(m => m.isFreeThrow && m.made)
      if (idx !== -1) {
        const actualIdx = prev.length - 1 - idx
        return [...prev.slice(0, actualIdx), ...prev.slice(actualIdx + 1)]
      }
      return prev
    })
  }

  const handleFreeThrowMissedIncrement = () => {
    handleShotAttemptedIncrement('ftAttempted')
    // Add marker on court map
    const marker = {
      id: Date.now(),
      x: FT_POSITION.x + (Math.random() - 0.5) * 20,
      y: FT_POSITION.y + (Math.random() - 0.5) * 10,
      made: false,
      isThreePointer: false,
      isFreeThrow: true,
      quarter: timer.quarter
    }
    setShotMarkers(prev => [...prev, marker])
  }

  const handleFreeThrowMissedDecrement = () => {
    handleShotAttemptedDecrement('ftMade', 'ftAttempted')
    // Remove last FT missed marker
    setShotMarkers(prev => {
      const idx = [...prev].reverse().findIndex(m => m.isFreeThrow && !m.made)
      if (idx !== -1) {
        const actualIdx = prev.length - 1 - idx
        return [...prev.slice(0, actualIdx), ...prev.slice(actualIdx + 1)]
      }
      return prev
    })
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

  // Backup history to JSON file
  const backupHistory = (updatedHistory) => {
    const backupData = {
      exportDate: new Date().toISOString(),
      player: player,
      matchCount: updatedHistory.length,
      history: updatedHistory
    }
    const blob = new Blob([JSON.stringify(backupData, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    const date = new Date().toLocaleDateString('fr-FR').replace(/\//g, '-')
    a.download = `backup_stats_${player.name || 'joueur'}_${date}.json`
    a.click()
    URL.revokeObjectURL(url)
  }

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

    // Use live score directly
    const matchScore = {
      team: liveScoreTeam,
      opponent: liveScoreOpponent
    }
    // Check for new records BEFORE saving
    const tempMatch = {
      summary: {
        points: (stats.fg2Made * 2) + (stats.fg3Made * 3) + stats.ftMade,
        rebounds: stats.offRebounds + stats.defRebounds,
        assists: stats.assists,
        steals: stats.steals,
        blocks: stats.blocks
      },
      plusMinus
    }
    const newRecords = checkNewRecords(tempMatch)

    // Confirmation avant sauvegarde
    if (!confirm('Sauvegarder et terminer le match ?')) return

    const matchStreaks = { bestStreak: streaks.bestStreak, bestPointsStreak: streaks.bestPointsStreak }
    const matchQuarterStats = getStatsByQuarter()
    const playingTimeData = { onCourt: playingTime.playingTime, bench: playingTime.benchTime }
    const savedMatch = saveMatch(player, stats, opponent, shotMarkers, matchScore, matchLocation, plusMinus, matchNotes, matchStreaks, matchQuarterStats, playingTimeData)

    const updatedHistory = [...history, savedMatch]
    backupHistory(updatedHistory)

    // Show records notification if any
    if (newRecords.length > 0) {
      setRecordNotification({ records: newRecords })
    } else {
      alert('Match sauvegardé !')
    }

    // Proposer sync vers Gist si configuré
    if (githubToken && gistId) {
      if (confirm('Sauvegarder aussi sur GitHub Gist ?')) {
        autoSyncToGist(updatedHistory)
      }
    }

    // Reset for next match
    resetStats()
    timer.resetTimer()
    playingTime.resetPlayingTime()
    setLiveScoreTeam(0)
    setLiveScoreOpponent(0)
    setPlusMinus(0)
    setLastPlusMinusScore({ team: 0, opponent: 0 })
    setOpponent('')
    setMatchLocation('home')
    setShotMarkers([])  // Clear shot markers
    setMatchNotes({ strengths: '', improvements: '' })
  }

  const handleDeleteMatch = (matchId) => {
    if (confirm('Supprimer ce match ?')) {
      deleteMatch(matchId)
    }
  }

  const handleEditOpponent = (matchId, currentOpponent) => {
    const newOpponent = prompt('Modifier l\'adversaire :', currentOpponent || '')
    if (newOpponent !== null && newOpponent !== currentOpponent) {
      updateMatchOpponent(matchId, newOpponent)
    }
  }

  const generateMatchImage = (match) => {
    const canvas = document.createElement('canvas')
    const ctx = canvas.getContext('2d')
    canvas.width = 600
    canvas.height = 800

    // Background
    ctx.fillStyle = '#1a1a2e'
    ctx.fillRect(0, 0, 600, 800)

    // Header
    ctx.fillStyle = '#61dafb'
    ctx.font = 'bold 28px sans-serif'
    ctx.textAlign = 'center'
    ctx.fillText('🏀 Stats Basket', 300, 45)

    // Match info
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 22px sans-serif'
    const matchDate = new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })
    ctx.fillText(match.opponent ? `vs ${match.opponent}` : 'Match', 300, 85)
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText(`${matchDate} | ${match.location === 'away' ? 'Extérieur' : 'Domicile'}`, 300, 110)

    // Score
    if (match.score) {
      ctx.font = 'bold 36px sans-serif'
      ctx.fillStyle = match.score.team > match.score.opponent ? '#2ecc71' : match.score.team < match.score.opponent ? '#e74c3c' : '#fff'
      ctx.fillText(`${match.score.team} - ${match.score.opponent}`, 300, 160)
    }

    // Player
    ctx.font = '18px sans-serif'
    ctx.fillStyle = '#61dafb'
    ctx.fillText(`${match.player.name} #${match.player.number}`, 300, 195)

    // Stats grid
    const stats = [
      { label: 'PTS', value: match.summary.points, big: true },
      { label: 'REB', value: match.summary.rebounds },
      { label: 'AST', value: match.summary.assists },
      { label: 'STL', value: match.summary.steals },
      { label: 'BLK', value: match.summary.blocks },
      { label: 'FG%', value: `${match.summary.fgPercentage}%` },
      { label: 'FT%', value: `${match.summary.ftPercentage}%` },
      { label: '+/-', value: match.plusMinus > 0 ? `+${match.plusMinus}` : match.plusMinus },
    ]

    let y = 240
    // Points big
    ctx.fillStyle = '#fff'
    ctx.font = 'bold 60px sans-serif'
    ctx.fillText(match.summary.points, 300, y + 40)
    ctx.font = '16px sans-serif'
    ctx.fillStyle = 'rgba(255,255,255,0.6)'
    ctx.fillText('POINTS', 300, y + 65)

    y = 330
    const cols = 4
    const cellW = 140
    const startX = 20
    stats.slice(1).forEach((stat, i) => {
      const col = i % cols
      const row = Math.floor(i / cols)
      const x = startX + col * cellW + cellW / 2
      const cy = y + row * 80

      ctx.fillStyle = 'rgba(255,255,255,0.05)'
      ctx.beginPath()
      ctx.roundRect(startX + col * cellW + 5, cy - 25, cellW - 10, 65, 8)
      ctx.fill()

      ctx.fillStyle = '#fff'
      ctx.font = 'bold 24px sans-serif'
      ctx.fillText(String(stat.value), x, cy + 8)
      ctx.fillStyle = 'rgba(255,255,255,0.5)'
      ctx.font = '12px sans-serif'
      ctx.fillText(stat.label, x, cy + 28)
    })

    // Efficiency
    y = 510
    if (match.efficiency) {
      ctx.fillStyle = 'rgba(97,218,251,0.1)'
      ctx.beginPath()
      ctx.roundRect(20, y, 560, 60, 10)
      ctx.fill()

      const effStats = [
        { label: 'TS%', value: `${match.efficiency.trueShootingPct}%` },
        { label: 'GmSc', value: match.efficiency.gameScore },
        { label: 'PER', value: match.efficiency.per },
        { label: 'USG%', value: `${match.efficiency.usageRate}%` },
      ]
      effStats.forEach((stat, i) => {
        const x = 90 + i * 140
        ctx.fillStyle = '#61dafb'
        ctx.font = 'bold 18px sans-serif'
        ctx.fillText(String(stat.value), x, y + 30)
        ctx.fillStyle = 'rgba(255,255,255,0.5)'
        ctx.font = '11px sans-serif'
        ctx.fillText(stat.label, x, y + 48)
      })
    }

    // Shooting detail
    y = 600
    ctx.fillStyle = 'rgba(255,255,255,0.7)'
    ctx.font = '14px sans-serif'
    const shootingLine = `2PTS: ${match.stats.fg2Made}/${match.stats.fg2Attempted}  |  3PTS: ${match.stats.fg3Made}/${match.stats.fg3Attempted}  |  LF: ${match.stats.ftMade}/${match.stats.ftAttempted}`
    ctx.fillText(shootingLine, 300, y)

    // Notes
    y = 640
    if (match.notes?.strengths) {
      ctx.fillStyle = 'rgba(46,204,113,0.6)'
      ctx.font = '13px sans-serif'
      ctx.fillText(`💪 ${match.notes.strengths}`, 300, y)
      y += 25
    }
    if (match.notes?.improvements) {
      ctx.fillStyle = 'rgba(231,76,60,0.6)'
      ctx.font = '13px sans-serif'
      ctx.fillText(`📈 ${match.notes.improvements}`, 300, y)
    }

    // Footer
    ctx.fillStyle = 'rgba(255,255,255,0.3)'
    ctx.font = '12px sans-serif'
    ctx.fillText('Stats Basket App', 300, 780)

    return canvas
  }

  const handleShareMatch = async (matchId) => {
    const match = history.find(m => m.id === matchId)
    if (!match) return

    const canvas = generateMatchImage(match)
    canvas.toBlob(async (blob) => {
      if (navigator.share && navigator.canShare) {
        const file = new File([blob], `stats_${match.opponent || 'match'}.png`, { type: 'image/png' })
        try {
          await navigator.share({
            title: `Stats vs ${match.opponent || 'Match'}`,
            files: [file]
          })
        } catch {
          // Fallback: download
          downloadBlob(blob, `stats_${match.opponent || 'match'}.png`)
        }
      } else {
        downloadBlob(blob, `stats_${match.opponent || 'match'}.png`)
      }
    }, 'image/png')
  }

  const handleExportPDF = (matchId) => {
    const match = history.find(m => m.id === matchId)
    if (!match) return

    const canvas = generateMatchImage(match)
    const imgData = canvas.toDataURL('image/png')
    // Create a printable HTML page with the image
    const printWindow = window.open('', '_blank')
    printWindow.document.write(`
      <html><head><title>Stats vs ${match.opponent || 'Match'}</title>
      <style>body{margin:0;display:flex;justify-content:center;align-items:center;min-height:100vh;background:#fff;}
      img{max-width:100%;height:auto;}
      @media print{body{margin:0;}img{width:100%;}}
      </style></head><body>
      <img src="${imgData}" />
      <script>setTimeout(()=>window.print(),500)<\/script>
      </body></html>
    `)
    printWindow.document.close()
  }

  const downloadBlob = (blob, filename) => {
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = filename
    a.click()
    URL.revokeObjectURL(url)
  }

  const handleAddPhoto = (matchId) => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = 'image/*'
    input.capture = 'environment'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const canvas = document.createElement('canvas')
      const ctx = canvas.getContext('2d')
      const img = new Image()
      img.onload = () => {
        const maxSize = 400
        let w = img.width, h = img.height
        if (w > h) { h = (h / w) * maxSize; w = maxSize }
        else { w = (w / h) * maxSize; h = maxSize }
        canvas.width = w
        canvas.height = h
        ctx.drawImage(img, 0, 0, w, h)
        const compressed = canvas.toDataURL('image/jpeg', 0.6)
        updateMatchPhoto(matchId, compressed)
      }
      img.src = URL.createObjectURL(file)
    }
    input.click()
  }

  const handleEditScore = (matchId, currentScore) => {
    const teamScore = prompt('Score équipe :', currentScore?.team ?? '')
    if (teamScore === null) return
    const oppScore = prompt('Score adversaire :', currentScore?.opponent ?? '')
    if (oppScore === null) return
    const team = parseInt(teamScore)
    const opp = parseInt(oppScore)
    if (!isNaN(team) && !isNaN(opp)) {
      updateMatchScore(matchId, { team, opponent: opp })
    }
  }

  const handleClearHistory = () => {
    if (confirm('Supprimer tout l\'historique ? Cette action est irréversible.')) {
      clearHistory()
    }
  }

  const handleImportHistory = () => {
    const input = document.createElement('input')
    input.type = 'file'
    input.accept = '.json'
    input.onchange = (e) => {
      const file = e.target.files[0]
      if (!file) return

      const reader = new FileReader()
      reader.onload = (event) => {
        try {
          const data = JSON.parse(event.target.result)
          if (data.history && Array.isArray(data.history)) {
            const existingIds = new Set(history.map(m => m.id))
            const newMatches = data.history.filter(m => !existingIds.has(m.id))
            const duplicates = data.history.length - newMatches.length

            if (history.length > 0 && newMatches.length > 0) {
              const msg = `Backup du ${new Date(data.exportDate).toLocaleDateString('fr-FR')} : ${data.history.length} match(s)\n\n` +
                `${newMatches.length} nouveau(x) match(s) à ajouter` +
                (duplicates > 0 ? `, ${duplicates} déjà présent(s)` : '') +
                `\n\nFusionner avec l'historique actuel (${history.length} match(s)) ?`
              if (confirm(msg)) {
                const merged = [...history, ...newMatches].sort((a, b) => new Date(a.date) - new Date(b.date))
                importHistory(merged)
                alert(`Fusion réussie ! ${merged.length} match(s) au total.`)
              }
            } else if (history.length === 0) {
              if (confirm(`Restaurer ${data.history.length} match(s) depuis le backup du ${new Date(data.exportDate).toLocaleDateString('fr-FR')} ?`)) {
                importHistory(data.history)
                alert('Historique restauré avec succès !')
              }
            } else {
              alert('Aucun nouveau match à importer (tous déjà présents).')
            }
          } else {
            alert('Fichier de backup invalide.')
          }
        } catch {
          alert('Erreur lors de la lecture du fichier.')
        }
      }
      reader.readAsText(file)
    }
    input.click()
  }

  // GitHub Gist functions
  const saveGithubToken = (token) => {
    const cleanToken = token.trim()
    setGithubToken(cleanToken)
    if (cleanToken) {
      localStorage.setItem('basketGithubToken', btoa(cleanToken))
    } else {
      localStorage.removeItem('basketGithubToken')
    }
  }

  const saveToGist = async () => {
    if (!githubToken) {
      setShowGistSettings(true)
      return
    }

    setGistLoading(true)
    const backupData = {
      exportDate: new Date().toISOString(),
      player: player,
      matchCount: history.length,
      history: history
    }

    try {
      const gistData = {
        description: `Stats Basket - Backup ${player.name || 'joueur'}`,
        public: false,
        files: {
          'stats_basket_backup.json': {
            content: JSON.stringify(backupData, null, 2)
          }
        }
      }

      let response
      if (gistId) {
        // Update existing gist
        response = await fetch(`https://api.github.com/gists/${gistId}`, {
          method: 'PATCH',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        })
      } else {
        // Create new gist
        response = await fetch('https://api.github.com/gists', {
          method: 'POST',
          headers: {
            'Authorization': `token ${githubToken}`,
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(gistData)
        })
      }

      if (response.ok) {
        const data = await response.json()
        setGistId(data.id)
        localStorage.setItem('basketGistId', data.id)
        alert(`Sauvegardé sur GitHub Gist !\nID: ${data.id}`)
      } else {
        const error = await response.json()
        alert(`Erreur: ${error.message || 'Impossible de sauvegarder'}`)
      }
    } catch (err) {
      alert(`Erreur: ${err.message}`)
    } finally {
      setGistLoading(false)
    }
  }

  // Auto-sync silencieux vers Gist (appelé après chaque sauvegarde de match)
  const autoSyncToGist = async (updatedHistory) => {
    if (!githubToken || !gistId) return

    const backupData = {
      exportDate: new Date().toISOString(),
      player: player,
      matchCount: updatedHistory.length,
      history: updatedHistory
    }

    try {
      const response = await fetch(`https://api.github.com/gists/${gistId}`, {
        method: 'PATCH',
        headers: {
          'Authorization': `token ${githubToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          description: `Stats Basket - Backup ${player.name || 'joueur'} (${updatedHistory.length} matchs)`,
          files: {
            'stats_basket_backup.json': {
              content: JSON.stringify(backupData, null, 2)
            }
          }
        })
      })

      if (!response.ok) {
        console.warn('Auto-sync Gist échoué:', response.status)
      }
    } catch (err) {
      console.warn('Auto-sync Gist erreur:', err.message)
    }
  }

  const loadFromGist = async () => {
    if (!githubToken) {
      setShowGistSettings(true)
      return
    }

    const inputGistId = gistId || prompt('Entre l\'ID du Gist à charger:')
    if (!inputGistId) return

    setGistLoading(true)
    try {
      const response = await fetch(`https://api.github.com/gists/${inputGistId}`, {
        headers: {
          'Authorization': `token ${githubToken}`
        }
      })

      if (response.ok) {
        const data = await response.json()
        const fileContent = data.files['stats_basket_backup.json']?.content
        if (fileContent) {
          const backupData = JSON.parse(fileContent)
          if (backupData.history && Array.isArray(backupData.history)) {
            const playerInfo = backupData.player ? ` (${backupData.player.name || 'Joueur'} #${backupData.player.number || '0'})` : ''
            const existingIds = new Set(history.map(m => m.id))
            const newMatches = backupData.history.filter(m => !existingIds.has(m.id))
            const duplicates = backupData.history.length - newMatches.length

            if (history.length > 0 && newMatches.length > 0) {
              const msg = `Gist${playerInfo} : ${backupData.history.length} match(s)\n` +
                `Backup du ${new Date(backupData.exportDate).toLocaleDateString('fr-FR')}\n\n` +
                `${newMatches.length} nouveau(x) match(s) à ajouter` +
                (duplicates > 0 ? `, ${duplicates} déjà présent(s)` : '') +
                `\n\nFusionner avec l'historique actuel (${history.length} match(s)) ?`
              if (confirm(msg)) {
                if (backupData.player) {
                  if (backupData.player.name) updatePlayer('name', backupData.player.name)
                  if (backupData.player.number) updatePlayer('number', backupData.player.number)
                }
                const merged = [...history, ...newMatches].sort((a, b) => new Date(a.date) - new Date(b.date))
                importHistory(merged)
                setGistId(inputGistId)
                localStorage.setItem('basketGistId', inputGistId)
                alert(`Fusion réussie ! ${merged.length} match(s) au total.`)
              }
            } else if (history.length === 0) {
              if (confirm(`Restaurer ${backupData.history.length} match(s)${playerInfo} depuis le Gist ?\nBackup du ${new Date(backupData.exportDate).toLocaleDateString('fr-FR')}`)) {
                if (backupData.player) {
                  if (backupData.player.name) updatePlayer('name', backupData.player.name)
                  if (backupData.player.number) updatePlayer('number', backupData.player.number)
                }
                importHistory(backupData.history)
                setGistId(inputGistId)
                localStorage.setItem('basketGistId', inputGistId)
                alert('Données joueur et historique restaurés depuis GitHub Gist !')
              }
            } else {
              alert('Aucun nouveau match à importer (tous déjà présents).')
            }
          } else {
            alert('Fichier de backup invalide dans le Gist.')
          }
        } else {
          alert('Fichier stats_basket_backup.json non trouvé dans le Gist.')
        }
      } else {
        const errData = await response.json().catch(() => null)
        alert(`Erreur ${response.status}: ${errData?.message || 'Gist non trouvé ou accès refusé.'}`)
      }
    } catch (err) {
      alert(`Erreur réseau: ${err.message}`)
    } finally {
      setGistLoading(false)
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
          // Importer l'historique si présent (avec fusion)
          if (data.history && Array.isArray(data.history)) {
            const existingIds = new Set(history.map(m => m.id))
            const newMatches = data.history.filter(m => !existingIds.has(m.id))

            if (newMatches.length > 0) {
              if (confirm(`${newMatches.length} nouveau(x) match(s) trouvé(s). Fusionner avec l'historique actuel ?`)) {
                const merged = [...history, ...newMatches].sort((a, b) => new Date(a.date) - new Date(b.date))
                importHistory(merged)
                alert(`Fusion réussie ! ${merged.length} match(s) au total.`)
              }
            } else if (data.history.length > 0) {
              alert('Données joueur importées. Aucun nouveau match à ajouter.')
            } else {
              alert('Données importées avec succès !')
            }
          } else {
            alert('Données importées avec succès !')
          }
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
      timer.resetTimer()
      playingTime.resetPlayingTime()
      setShotMarkers([])
      localStorage.setItem('basketShotMarkers', JSON.stringify([]))
      setOpponent('')
      setMatchLocation('home')
      setLiveScoreTeam(0)
      setLiveScoreOpponent(0)
      setPlusMinus(0)
      setLastPlusMinusScore({ team: 0, opponent: 0 })
      setMatchNotes({ strengths: '', improvements: '' })
    }
  }

  const handleShotRecorded = (isThreePointer, made) => {
    if (isThreePointer) {
      if (made) {
        handleShotMadeIncrement('fg3Made', 'fg3Attempted', 3)
      } else {
        handleShotAttemptedIncrement('fg3Attempted')
      }
    } else {
      if (made) {
        handleShotMadeIncrement('fg2Made', 'fg2Attempted', 2)
      } else {
        handleShotAttemptedIncrement('fg2Attempted')
      }
    }
  }

  // Called when a shot marker is removed from the court map
  const handleShotRemoved = (marker) => {
    if (marker.isFreeThrow) {
      // Free throw
      if (marker.made) {
        updateStatWithTime('ftMade', -1)
        updateStatWithTime('ftAttempted', -1, true)
        setLiveScoreTeam(prev => Math.max(0, prev - 1))
      } else {
        updateStatWithTime('ftAttempted', -1)
      }
    } else if (marker.isThree) {
      // 3-pointer
      if (marker.made) {
        updateStatWithTime('fg3Made', -1)
        updateStatWithTime('fg3Attempted', -1, true)
        setLiveScoreTeam(prev => Math.max(0, prev - 3))
      } else {
        updateStatWithTime('fg3Attempted', -1)
      }
    } else {
      // 2-pointer
      if (marker.made) {
        updateStatWithTime('fg2Made', -1)
        updateStatWithTime('fg2Attempted', -1, true)
        setLiveScoreTeam(prev => Math.max(0, prev - 2))
      } else {
        updateStatWithTime('fg2Attempted', -1)
      }
    }
  }

  // Handle deletion of an action from history
  const handleDeleteAction = (action) => {
    // For made shots, we need to also decrement attempted and update score
    if (action.type === 'fg2Made') {
      deleteAction(action.id) // This decrements fg2Made
      updateStatWithTime('fg2Attempted', -1, true) // Also decrement attempted (silent)
      setLiveScoreTeam(prev => Math.max(0, prev - 2))
      // Also remove corresponding marker from court
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => !m.isThree && !m.isFreeThrow && m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else if (action.type === 'fg3Made') {
      deleteAction(action.id)
      updateStatWithTime('fg3Attempted', -1, true)
      setLiveScoreTeam(prev => Math.max(0, prev - 3))
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => m.isThree && m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else if (action.type === 'ftMade') {
      deleteAction(action.id)
      updateStatWithTime('ftAttempted', -1, true)
      setLiveScoreTeam(prev => Math.max(0, prev - 1))
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => m.isFreeThrow && m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else if (action.type === 'fg2Attempted') {
      // Missed 2pt shot
      deleteAction(action.id)
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => !m.isThree && !m.isFreeThrow && !m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else if (action.type === 'fg3Attempted') {
      // Missed 3pt shot
      deleteAction(action.id)
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => m.isThree && !m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else if (action.type === 'ftAttempted') {
      // Missed free throw
      deleteAction(action.id)
      setShotMarkers(prev => {
        const idx = [...prev].reverse().findIndex(m => m.isFreeThrow && !m.made)
        if (idx !== -1) return [...prev.slice(0, prev.length - 1 - idx), ...prev.slice(prev.length - idx)]
        return prev
      })
    } else {
      // Other stats (rebounds, assists, etc.) - just delete the action
      deleteAction(action.id)
    }
    setActionToDelete(null)
  }

  return (
    <>
      <style>{styles}</style>
      <div className="container">
        <h1>🏀 Stats Basket 2026</h1>

        {/* Navigation */}
        <div className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            🎮 Match
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            📋 Historique ({history.length})
          </button>
          <button
            className={`nav-tab ${activeTab === 'training' ? 'active' : ''}`}
            onClick={() => setActiveTab('training')}
          >
            🏋️ Entraîn.
          </button>
          <button
            className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            📈 Analyse
          </button>
          <button
            className={`nav-tab ${activeTab === 'options' ? 'active' : ''}`}
            onClick={() => setActiveTab('options')}
          >
            ⚙️
          </button>
          <button
            className="help-btn"
            onClick={() => setShowHelpModal(true)}
            title="Aide & Légende"
          >
            ❓
          </button>
        </div>

        {activeTab === 'match' ? (
          <>
            {/* Compact header with timer */}
            <div className="match-header-compact">
              <div className="player-timer-row">
                <div className="player-compact">
                  <span className="player-name-compact">{player.name || 'Joueur'}</span>
                  <span className="player-number-compact">#{player.number || '0'}</span>
                </div>
                <div className="timer-compact">
                  <span className="quarter-compact">Q{timer.quarter}</span>
                  <span className={`time-compact ${timer.isRunning ? 'running' : ''}`}>{timer.formatTime()}</span>
                  <button className="timer-toggle-compact" onClick={timer.toggleTimer}>
                    {timer.isRunning ? '⏸' : '▶'}
                  </button>
                </div>
                <button
                  className={`court-toggle-compact ${playingTime.isOnCourt ? 'on-court' : 'on-bench'}`}
                  onClick={playingTime.toggleOnCourt}
                >
                  {playingTime.isOnCourt ? '🏃' : '🪑'} {playingTime.formatPlayingTime(playingTime.playingTime)}
                </button>
              </div>
              {/* Score en direct avec boutons +/- */}
              <div className="live-score-row">
                <div className="score-team">
                  <span className="score-label">Équipe</span>
                  <div className="score-controls">
                    <button onClick={() => setLiveScoreTeam(Math.max(0, liveScoreTeam - 1))}>-</button>
                    <span className="score-value">{liveScoreTeam}</span>
                    <button onClick={() => setLiveScoreTeam(liveScoreTeam + 1)}>+</button>
                  </div>
                </div>
                <span className="score-vs">-</span>
                <div className="score-team">
                  <span className="score-label">Adversaire</span>
                  <div className="score-controls">
                    <button onClick={() => setLiveScoreOpponent(Math.max(0, liveScoreOpponent - 1))}>-</button>
                    <span className="score-value">{liveScoreOpponent}</span>
                    <button onClick={() => setLiveScoreOpponent(liveScoreOpponent + 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Court Map - Full Width */}
            <CourtMap
              onShotRecorded={handleShotRecorded}
              onShotRemoved={handleShotRemoved}
              quarter={timer.quarter}
              timeLeft={timer.timeLeft}
              shotMarkers={shotMarkers}
              setShotMarkers={setShotMarkers}
              actionHistory={actionHistory}
              onShowReplay={() => setShowReplay(true)}
              onShowHistory={() => setShowActionPanel(true)}
            />

            {/* Quick Stats Grid - Compact for mobile */}
            {/* ATTAQUE */}
            <div className="stats-category">
              <h4 className="stats-category-title">ATTAQUE</h4>
              <div className="quick-stats-grid">
                <div className="quick-stat">
                  <span className="qs-label">2PTS</span>
                  <div className="qs-controls">
                    <button onClick={() => handleShotMadeDecrement('fg2Made', 'fg2Attempted', 2)}>-</button>
                    <span className="qs-value">{stats.fg2Made}/{stats.fg2Attempted}</span>
                    <button onClick={() => handleShotMadeIncrement('fg2Made', 'fg2Attempted', 2)}>+</button>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="qs-label">3PTS</span>
                  <div className="qs-controls">
                    <button onClick={() => handleShotMadeDecrement('fg3Made', 'fg3Attempted', 3)}>-</button>
                    <span className="qs-value">{stats.fg3Made}/{stats.fg3Attempted}</span>
                    <button onClick={() => handleShotMadeIncrement('fg3Made', 'fg3Attempted', 3)}>+</button>
                  </div>
                </div>
                <div className="quick-stat qs-positive">
                  <span className="qs-label">LF +</span>
                  <div className="qs-controls">
                    <button onClick={handleFreeThrowMadeDecrement}>-</button>
                    <span className="qs-value">{stats.ftMade}</span>
                    <button onClick={handleFreeThrowMadeIncrement}>+</button>
                  </div>
                </div>
                <div className="quick-stat qs-negative">
                  <span className="qs-label">LF -</span>
                  <div className="qs-controls">
                    <button onClick={handleFreeThrowMissedDecrement}>-</button>
                    <span className="qs-value">{stats.ftAttempted - stats.ftMade}</span>
                    <button onClick={handleFreeThrowMissedIncrement}>+</button>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="qs-label">REB OFF</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('offRebounds', -1)}>-</button>
                    <span className="qs-value">{stats.offRebounds}</span>
                    <button onClick={() => updateStatWithTime('offRebounds', 1)}>+</button>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="qs-label">Passes</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('assists', -1)}>-</button>
                    <span className="qs-value">{stats.assists}</span>
                    <button onClick={() => updateStatWithTime('assists', 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* DÉFENSE */}
            <div className="stats-category">
              <h4 className="stats-category-title">DÉFENSE</h4>
              <div className="quick-stats-grid">
                <div className="quick-stat">
                  <span className="qs-label">REB DEF</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('defRebounds', -1)}>-</button>
                    <span className="qs-value">{stats.defRebounds}</span>
                    <button onClick={() => updateStatWithTime('defRebounds', 1)}>+</button>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="qs-label">Inter</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('steals', -1)}>-</button>
                    <span className="qs-value">{stats.steals}</span>
                    <button onClick={() => updateStatWithTime('steals', 1)}>+</button>
                  </div>
                </div>
                <div className="quick-stat">
                  <span className="qs-label">Contres</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('blocks', -1)}>-</button>
                    <span className="qs-value">{stats.blocks}</span>
                    <button onClick={() => updateStatWithTime('blocks', 1)}>+</button>
                  </div>
                </div>
                <div className="quick-stat qs-negative">
                  <span className="qs-label">Pertes</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('turnovers', -1)}>-</button>
                    <span className="qs-value">{stats.turnovers}</span>
                    <button onClick={() => updateStatWithTime('turnovers', 1)}>+</button>
                  </div>
                </div>
                <div className="quick-stat qs-negative">
                  <span className="qs-label">Fautes</span>
                  <div className="qs-controls">
                    <button onClick={() => updateStatWithTime('fouls', -1)}>-</button>
                    <span className="qs-value">{stats.fouls}</span>
                    <button onClick={() => updateStatWithTime('fouls', 1)}>+</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Points Total Display */}
            <div className="points-total-display">
              <span className="pts-label">TOTAL</span>
              <span className="pts-value">{summary.points} PTS</span>
              <span className="pts-breakdown">({stats.fg2Made * 2} + {stats.fg3Made * 3} + {stats.ftMade})</span>
            </div>

            {/* Streak Display */}
            {streaks.currentStreak >= 2 && (
              <div className="streak-display hot">
                <span className="streak-icon">🔥</span>
                <span className="streak-text">{streaks.currentStreak} tirs d'affilée!</span>
                <span className="streak-points">({streaks.currentPoints} pts)</span>
              </div>
            )}
            {streaks.bestStreak >= 3 && streaks.currentStreak < 2 && (
              <div className="streak-display best">
                <span className="streak-icon">⭐</span>
                <span className="streak-text">Meilleure série: {streaks.bestStreak}</span>
                <span className="streak-points">({streaks.bestPointsStreak} pts)</span>
              </div>
            )}

            {/* Toggle More Options */}
            <button className="more-options-toggle" onClick={() => setShowMoreOptions(!showMoreOptions)}>
              {showMoreOptions ? '▲ Masquer options' : '▼ Plus d\'options (Timer, Score, Stats...)'}
            </button>

            {showMoreOptions && (
              <div className="more-options-section">
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
                    if (timer.isRunning) timer.toggleTimer()
                    document.querySelector('.save-match-section')?.scrollIntoView({ behavior: 'smooth' })
                  }}
                  onAdjustTime={timer.adjustTime}
                />

                {/* Playing Time */}
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

                <StatsDisplay summary={summary} />
              </div>
            )}

            {/* Save Match Section */}
            <div className="save-match-section">
              <h3>💾 Sauvegarder le match</h3>
              <div className="save-match-form">
                <div className="location-toggle">
                  <button
                    className={`location-btn ${matchLocation === 'home' ? 'active' : ''}`}
                    onClick={() => setMatchLocation('home')}
                    type="button"
                  >
                    🏠 Domicile
                  </button>
                  <button
                    className={`location-btn ${matchLocation === 'away' ? 'active' : ''}`}
                    onClick={() => setMatchLocation('away')}
                    type="button"
                  >
                    ✈️ Extérieur
                  </button>
                </div>
                <input
                  type="text"
                  placeholder="Adversaire (optionnel)"
                  value={opponent}
                  onChange={(e) => setOpponent(e.target.value)}
                  className="opponent-input"
                />
                <div className="score-inputs auto-score">
                  <span className="auto-score-label">Score :</span>
                  <span className="auto-score-value">{liveScoreTeam}</span>
                  <span className="score-separator">-</span>
                  <span className="auto-score-value">{liveScoreOpponent}</span>
                </div>
                <div className="match-notes-section">
                  <textarea
                    placeholder="💪 Points forts du match..."
                    value={matchNotes.strengths}
                    onChange={(e) => setMatchNotes(prev => ({ ...prev, strengths: e.target.value }))}
                    className="match-notes-input"
                    rows="2"
                  />
                  <textarea
                    placeholder="📈 Points à améliorer..."
                    value={matchNotes.improvements}
                    onChange={(e) => setMatchNotes(prev => ({ ...prev, improvements: e.target.value }))}
                    className="match-notes-input"
                    rows="2"
                  />
                </div>
                <button className="save-btn" onClick={handleSaveMatch}>
                  Sauvegarder et terminer
                </button>
              </div>

              {/* Bouton Undo flottant */}
              {actionHistory.length > 0 && (
                <button className="undo-floating" onClick={undoLastAction}>
                  ↩ Annuler : {actionHistory[0]?.label}
                </button>
              )}
            </div>

            <div className="actions">
              <button className="action-btn" onClick={exportData}>📥 Exporter JSON</button>
              <button className="action-btn" onClick={handleImport}>📤 Importer</button>
              <button className="action-btn danger" onClick={handleReset}>🗑 Réinitialiser</button>
            </div>
          </>
        ) : null}

        {activeTab === 'history' && (
          <MatchHistory
            history={history}
            averages={averages}
            recentAverages3={getRecentAverages(3)}
            recentAverages5={getRecentAverages(5)}
            records={getRecords()}
            goals={goals}
            onDelete={handleDeleteMatch}
            onEditOpponent={handleEditOpponent}
            onEditScore={handleEditScore}
            onAddPhoto={handleAddPhoto}
            onShare={handleShareMatch}
            onExportPDF={handleExportPDF}
          />
        )}

        {activeTab === 'training' && (
          <div className="training-page">
            <h2>🏋️ Mode Entraînement</h2>
            <p className="training-desc">Entraîne tes tirs sans créer de match</p>

            <CourtMap
              shotMarkers={trainingMarkers}
              onAddMarker={(marker) => {
                setTrainingMarkers(prev => [...prev, marker])
                if (marker.isFreeThrow) {
                  if (marker.made) setTrainingStats(p => ({ ...p, ftMade: p.ftMade + 1, ftAttempted: p.ftAttempted + 1 }))
                  else setTrainingStats(p => ({ ...p, ftAttempted: p.ftAttempted + 1 }))
                } else if (marker.isThree) {
                  if (marker.made) setTrainingStats(p => ({ ...p, fg3Made: p.fg3Made + 1, fg3Attempted: p.fg3Attempted + 1 }))
                  else setTrainingStats(p => ({ ...p, fg3Attempted: p.fg3Attempted + 1 }))
                } else {
                  if (marker.made) setTrainingStats(p => ({ ...p, fg2Made: p.fg2Made + 1, fg2Attempted: p.fg2Attempted + 1 }))
                  else setTrainingStats(p => ({ ...p, fg2Attempted: p.fg2Attempted + 1 }))
                }
              }}
              undoLastMarker={() => {
                if (trainingMarkers.length === 0) return
                const last = trainingMarkers[trainingMarkers.length - 1]
                setTrainingMarkers(prev => prev.slice(0, -1))
                if (last.isFreeThrow) {
                  if (last.made) setTrainingStats(p => ({ ...p, ftMade: p.ftMade - 1, ftAttempted: p.ftAttempted - 1 }))
                  else setTrainingStats(p => ({ ...p, ftAttempted: p.ftAttempted - 1 }))
                } else if (last.isThree) {
                  if (last.made) setTrainingStats(p => ({ ...p, fg3Made: p.fg3Made - 1, fg3Attempted: p.fg3Attempted - 1 }))
                  else setTrainingStats(p => ({ ...p, fg3Attempted: p.fg3Attempted - 1 }))
                } else {
                  if (last.made) setTrainingStats(p => ({ ...p, fg2Made: p.fg2Made - 1, fg2Attempted: p.fg2Attempted - 1 }))
                  else setTrainingStats(p => ({ ...p, fg2Attempted: p.fg2Attempted - 1 }))
                }
              }}
              clearAllMarkers={() => {
                setTrainingMarkers([])
                setTrainingStats({ fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0 })
              }}
              quarter={1}
            />

            <div className="training-stats">
              <div className="training-stat">
                <span className="ts-label">2PTS</span>
                <span className="ts-value">{trainingStats.fg2Made}/{trainingStats.fg2Attempted}</span>
                <span className="ts-pct">{trainingStats.fg2Attempted > 0 ? Math.round(trainingStats.fg2Made / trainingStats.fg2Attempted * 100) : 0}%</span>
              </div>
              <div className="training-stat">
                <span className="ts-label">3PTS</span>
                <span className="ts-value">{trainingStats.fg3Made}/{trainingStats.fg3Attempted}</span>
                <span className="ts-pct">{trainingStats.fg3Attempted > 0 ? Math.round(trainingStats.fg3Made / trainingStats.fg3Attempted * 100) : 0}%</span>
              </div>
              <div className="training-stat">
                <span className="ts-label">LF</span>
                <span className="ts-value">{trainingStats.ftMade}/{trainingStats.ftAttempted}</span>
                <span className="ts-pct">{trainingStats.ftAttempted > 0 ? Math.round(trainingStats.ftMade / trainingStats.ftAttempted * 100) : 0}%</span>
              </div>
              <div className="training-stat total">
                <span className="ts-label">TOTAL</span>
                <span className="ts-value">
                  {trainingStats.fg2Made + trainingStats.fg3Made + trainingStats.ftMade}/
                  {trainingStats.fg2Attempted + trainingStats.fg3Attempted + trainingStats.ftAttempted}
                </span>
                <span className="ts-pct">
                  {(trainingStats.fg2Attempted + trainingStats.fg3Attempted + trainingStats.ftAttempted) > 0
                    ? Math.round((trainingStats.fg2Made + trainingStats.fg3Made + trainingStats.ftMade) /
                      (trainingStats.fg2Attempted + trainingStats.fg3Attempted + trainingStats.ftAttempted) * 100) : 0}%
                </span>
              </div>
            </div>

            <button
              className="training-reset"
              onClick={() => {
                if (trainingMarkers.length === 0 || confirm('Réinitialiser l\'entraînement ?')) {
                  setTrainingMarkers([])
                  setTrainingStats({ fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0 })
                }
              }}
            >
              🔄 Réinitialiser
            </button>
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-page">
            <h2>📈 Analyse des performances</h2>

            {history.length === 0 ? (
              <div className="no-data-message">
                <p>Aucune donnée à analyser.</p>
                <p>Sauvegarde des matchs pour voir tes statistiques ici !</p>
              </div>
            ) : (
              <>
                {/* Filter Section */}
                <div className="analysis-filter">
                  <label>Afficher :</label>
                  <select
                    value={analysisSelectedMatchId}
                    onChange={(e) => setAnalysisSelectedMatchId(e.target.value === 'all' ? 'all' : Number(e.target.value))}
                    className="match-select"
                  >
                    <option value="all">📊 Tous les matchs</option>
                    {[...history].reverse().map((match, index) => (
                      <option key={match.id} value={match.id}>
                        {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {match.opponent ? ` vs ${match.opponent}` : ` - Match ${history.length - index}`}
                        {' '}({match.summary.points} pts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shot Charts */}
                <div className="analysis-section">
                  <h3>🎯 Cartes des tirs</h3>
                  <div className="shot-charts-grid">
                    <ShotHeatmap history={history} selectedMatchId={analysisSelectedMatchId} />
                    <ThermalHeatmap history={history} selectedMatchId={analysisSelectedMatchId} />
                  </div>
                </div>

                {/* Performance Charts */}
                <div className="analysis-section">
                  <h3>📊 Graphiques de performance</h3>
                  <div className="charts-grid">
                    <EvolutionChart history={history} />
                    <PerformanceRadar averages={averages} lastMatch={history[history.length - 1]} />
                  </div>
                </div>

                {/* Advanced Stats Section */}
                <div className="analysis-section">
                  <h3>📈 Stats avancées</h3>
                  {(() => {
                    // Calculate stats for selected match or all matches
                    const selectedMatch = analysisSelectedMatchId === 'all'
                      ? null
                      : history.find(m => m.id === analysisSelectedMatchId)

                    if (selectedMatch) {
                      // Single match stats
                      const eff = selectedMatch.efficiency || {}
                      return (
                        <div className="advanced-stats-grid">
                          <div className="advanced-stat">
                            <span className="adv-value">{eff.trueShootingPct || 0}%</span>
                            <span className="adv-label">TS%</span>
                            <span className="adv-desc">True Shooting</span>
                          </div>
                          <div className={`advanced-stat ${(eff.gameScore || 0) >= 10 ? 'positive' : (eff.gameScore || 0) < 0 ? 'negative' : ''}`}>
                            <span className="adv-value">{eff.gameScore || 0}</span>
                            <span className="adv-label">GmSc</span>
                            <span className="adv-desc">Game Score</span>
                          </div>
                          <div className={`advanced-stat ${(eff.per || 0) >= 15 ? 'positive' : (eff.per || 0) < 10 ? 'negative' : ''}`}>
                            <span className="adv-value">{eff.per || 0}</span>
                            <span className="adv-label">PER</span>
                            <span className="adv-desc">Player Efficiency</span>
                          </div>
                          <div className="advanced-stat">
                            <span className="adv-value">{eff.usageRate || 0}%</span>
                            <span className="adv-label">USG%</span>
                            <span className="adv-desc">Usage Rate</span>
                          </div>
                          <div className={`advanced-stat ${(selectedMatch.plusMinus || 0) > 0 ? 'positive' : (selectedMatch.plusMinus || 0) < 0 ? 'negative' : ''}`}>
                            <span className="adv-value">{(selectedMatch.plusMinus || 0) > 0 ? '+' : ''}{selectedMatch.plusMinus || 0}</span>
                            <span className="adv-label">+/-</span>
                            <span className="adv-desc">Plus/Minus</span>
                          </div>
                          {selectedMatch.streaks && selectedMatch.streaks.bestStreak > 0 && (
                            <div className="advanced-stat streak">
                              <span className="adv-value">🔥 {selectedMatch.streaks.bestStreak}</span>
                              <span className="adv-label">Série</span>
                              <span className="adv-desc">{selectedMatch.streaks.bestPointsStreak} pts</span>
                            </div>
                          )}
                        </div>
                      )
                    } else {
                      // All matches - calculate averages
                      const totals = history.reduce((acc, m) => ({
                        points: acc.points + m.summary.points,
                        fg2Made: acc.fg2Made + (m.stats?.fg2Made || 0),
                        fg2Attempted: acc.fg2Attempted + (m.stats?.fg2Attempted || 0),
                        fg3Made: acc.fg3Made + (m.stats?.fg3Made || 0),
                        fg3Attempted: acc.fg3Attempted + (m.stats?.fg3Attempted || 0),
                        ftAttempted: acc.ftAttempted + (m.stats?.ftAttempted || 0),
                        gameScoreSum: acc.gameScoreSum + (m.efficiency?.gameScore || 0),
                        perSum: acc.perSum + (m.efficiency?.per || 0),
                        usageSum: acc.usageSum + (m.efficiency?.usageRate || 0),
                        plusMinusSum: acc.plusMinusSum + (m.plusMinus || 0),
                        bestStreak: Math.max(acc.bestStreak, m.streaks?.bestStreak || 0),
                        bestPointsStreak: Math.max(acc.bestPointsStreak, m.streaks?.bestPointsStreak || 0),
                        count: acc.count + 1
                      }), { points: 0, fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftAttempted: 0, gameScoreSum: 0, perSum: 0, usageSum: 0, plusMinusSum: 0, bestStreak: 0, bestPointsStreak: 0, count: 0 })

                      const fga = totals.fg2Attempted + totals.fg3Attempted
                      const tsa = fga + 0.44 * totals.ftAttempted
                      const avgTS = tsa > 0 ? Math.round(totals.points / (2 * tsa) * 100) : 0
                      const avgGmSc = totals.count > 0 ? (totals.gameScoreSum / totals.count).toFixed(1) : 0
                      const avgPER = totals.count > 0 ? (totals.perSum / totals.count).toFixed(1) : 0
                      const avgUSG = totals.count > 0 ? Math.round(totals.usageSum / totals.count) : 0
                      const avgPM = totals.count > 0 ? (totals.plusMinusSum / totals.count).toFixed(1) : 0

                      return (
                        <div className="advanced-stats-grid">
                          <div className="advanced-stat">
                            <span className="adv-value">{avgTS}%</span>
                            <span className="adv-label">TS%</span>
                            <span className="adv-desc">True Shooting</span>
                          </div>
                          <div className={`advanced-stat ${parseFloat(avgGmSc) >= 10 ? 'positive' : parseFloat(avgGmSc) < 0 ? 'negative' : ''}`}>
                            <span className="adv-value">{avgGmSc}</span>
                            <span className="adv-label">GmSc moy.</span>
                            <span className="adv-desc">Game Score</span>
                          </div>
                          <div className={`advanced-stat ${parseFloat(avgPER) >= 15 ? 'positive' : parseFloat(avgPER) < 10 ? 'negative' : ''}`}>
                            <span className="adv-value">{avgPER}</span>
                            <span className="adv-label">PER moy.</span>
                            <span className="adv-desc">Player Efficiency</span>
                          </div>
                          <div className="advanced-stat">
                            <span className="adv-value">{avgUSG}%</span>
                            <span className="adv-label">USG% moy.</span>
                            <span className="adv-desc">Usage Rate</span>
                          </div>
                          <div className={`advanced-stat ${parseFloat(avgPM) > 0 ? 'positive' : parseFloat(avgPM) < 0 ? 'negative' : ''}`}>
                            <span className="adv-value">{parseFloat(avgPM) > 0 ? '+' : ''}{avgPM}</span>
                            <span className="adv-label">+/- moy.</span>
                            <span className="adv-desc">Plus/Minus</span>
                          </div>
                          {totals.bestStreak > 0 && (
                            <div className="advanced-stat streak">
                              <span className="adv-value">🔥 {totals.bestStreak}</span>
                              <span className="adv-label">Record série</span>
                              <span className="adv-desc">{totals.bestPointsStreak} pts</span>
                            </div>
                          )}
                        </div>
                      )
                    }
                  })()}
                </div>
              </>
            )}
          </div>
        )}

        {activeTab === 'options' && (
          <div className="options-page">
            <h2>⚙️ Options</h2>

            {/* Player Info Section */}
            <div className="options-section">
              <h3>👤 Joueur</h3>
              <PlayerInfo
                name={player.name}
                number={player.number}
                onNameChange={(v) => updatePlayer('name', v)}
                onNumberChange={(v) => updatePlayer('number', v)}
              />
            </div>

            {/* Theme Section */}
            <div className="options-section">
              <h3>🎨 Apparence</h3>
              <p className="options-description">
                Change le thème pour une meilleure visibilité selon l'environnement.
              </p>
              <div className="theme-toggle">
                <button
                  className={`theme-btn ${theme === 'dark' ? 'active' : ''}`}
                  onClick={() => setTheme('dark')}
                >
                  🌙 Sombre
                </button>
                <button
                  className={`theme-btn ${theme === 'light' ? 'active' : ''}`}
                  onClick={() => setTheme('light')}
                >
                  ☀️ Clair
                </button>
              </div>
            </div>

            {/* GitHub Gist Sync Section */}
            <div className="options-section">
              <h3>☁️ Synchronisation GitHub</h3>
              <p className="options-description">
                Sauvegarde et synchronise tes stats sur GitHub Gist pour y accéder depuis n'importe où.
              </p>
              <div className="gist-config">
                <div className="gist-status-line">
                  {githubToken ? (
                    <span className="gist-status connected">✓ Token configuré</span>
                  ) : (
                    <span className="gist-status">✗ Non configuré</span>
                  )}
                  <button
                    className="gist-config-btn"
                    onClick={() => { setTempToken(githubToken); setShowGistSettings(true) }}
                  >
                    {githubToken ? 'Modifier' : 'Configurer'}
                  </button>
                </div>
              </div>
              <div className="gist-actions">
                <button
                  className="gist-action-btn"
                  onClick={saveToGist}
                  disabled={gistLoading || history.length === 0 || !githubToken}
                >
                  {gistLoading ? '⏳' : '⬆️'} Sauvegarder sur Gist
                </button>
                <button
                  className="gist-action-btn"
                  onClick={loadFromGist}
                  disabled={gistLoading || !githubToken}
                >
                  {gistLoading ? '⏳' : '⬇️'} Charger depuis Gist
                </button>
              </div>
            </div>

            {/* Data Management */}
            <div className="options-section">
              <h3>💾 Gestion des données</h3>
              <div className="options-actions">
                <button className="options-btn" onClick={exportData}>
                  📥 Exporter les données (JSON)
                </button>
                <button className="options-btn" onClick={handleImport}>
                  📤 Importer des données
                </button>
                <button className="options-btn danger" onClick={handleClearHistory}>
                  🗑️ Effacer l'historique
                </button>
              </div>
            </div>

            {/* Objectifs */}
            <div className="options-section">
              <h3>🎯 Objectifs par match</h3>
              <div className="goals-grid">
                <div className="goal-input">
                  <label>Points</label>
                  <input
                    type="number"
                    value={goals.points}
                    onChange={(e) => setGoals(prev => ({ ...prev, points: e.target.value }))}
                    placeholder="Ex: 15"
                  />
                </div>
                <div className="goal-input">
                  <label>Rebonds</label>
                  <input
                    type="number"
                    value={goals.rebounds}
                    onChange={(e) => setGoals(prev => ({ ...prev, rebounds: e.target.value }))}
                    placeholder="Ex: 8"
                  />
                </div>
                <div className="goal-input">
                  <label>Passes D.</label>
                  <input
                    type="number"
                    value={goals.assists}
                    onChange={(e) => setGoals(prev => ({ ...prev, assists: e.target.value }))}
                    placeholder="Ex: 5"
                  />
                </div>
              </div>
            </div>
          </div>
        )}

        {/* Shot Replay */}
        {showReplay && (
          <ShotReplay
            shotMarkers={shotMarkers}
            actionHistory={actionHistory}
            onClose={() => setShowReplay(false)}
          />
        )}

        {/* Action History Panel */}
        {showActionPanel && (
          <div className="action-panel-overlay" onClick={() => setShowActionPanel(false)}>
            <div className="action-panel" onClick={e => e.stopPropagation()}>
              <div className="action-panel-header">
                <h3>📝 Historique des actions</h3>
                <button className="action-panel-close" onClick={() => setShowActionPanel(false)}>×</button>
              </div>
              <p className="action-panel-hint">Cliquer sur une action pour la supprimer</p>
              <div className="action-panel-list">
                {actionHistory.length === 0 ? (
                  <div className="action-empty">Aucune action enregistrée</div>
                ) : (
                  actionHistory.map(action => (
                    <div
                      key={action.id}
                      className="action-item clickable"
                      onClick={() => setActionToDelete(action)}
                    >
                      <span className="action-time">Q{action.quarter} {Math.floor(action.timeLeft / 60)}:{(action.timeLeft % 60).toString().padStart(2, '0')}</span>
                      <span className="action-label">{action.label}</span>
                      <span className="action-delete-hint">🗑</span>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        )}

        {/* Action Delete Confirmation Modal */}
        {actionToDelete && (
          <div className="confirm-overlay" onClick={() => setActionToDelete(null)}>
            <div className="confirm-modal" onClick={e => e.stopPropagation()}>
              <div className="confirm-icon">🗑</div>
              <p>Supprimer cette action ?</p>
              <p className="confirm-action-detail">
                <strong>{actionToDelete.label}</strong><br/>
                Q{actionToDelete.quarter} - {Math.floor(actionToDelete.timeLeft / 60)}:{(actionToDelete.timeLeft % 60).toString().padStart(2, '0')}
              </p>
              <p className="confirm-warning">Les stats seront mises à jour.</p>
              <div className="confirm-buttons">
                <button className="confirm-btn yes" onClick={() => handleDeleteAction(actionToDelete)}>
                  Oui, supprimer
                </button>
                <button className="confirm-btn no" onClick={() => setActionToDelete(null)}>
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Gist Settings Modal */}
        {showGistSettings && (
          <div className="gist-modal-overlay" onClick={() => setShowGistSettings(false)}>
            <div className="gist-modal" onClick={e => e.stopPropagation()}>
              <h3>GitHub Gist Configuration</h3>
              <div className="gist-modal-info">
                Pour sauvegarder tes stats sur GitHub Gist, tu as besoin d'un token personnel.<br/>
                Va sur <strong>github.com/settings/tokens</strong> et crée un token avec le scope "gist".
              </div>
              <div className="gist-input-group">
                <label>Token GitHub</label>
                <input
                  type="password"
                  placeholder="ghp_xxxxxxxxxxxx"
                  value={tempToken}
                  onChange={e => setTempToken(e.target.value)}
                />
              </div>
              {gistId && (
                <div className="gist-input-group">
                  <label>ID du Gist actuel</label>
                  <input
                    type="text"
                    value={gistId}
                    onChange={e => setGistId(e.target.value)}
                    placeholder="ID du Gist (optionnel)"
                  />
                </div>
              )}
              <div className="gist-modal-buttons">
                <button
                  className="gist-btn save"
                  onClick={() => {
                    saveGithubToken(tempToken)
                    setShowGistSettings(false)
                  }}
                >
                  Enregistrer
                </button>
                <button
                  className="gist-btn cancel"
                  onClick={() => setShowGistSettings(false)}
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Record Notification Modal */}
        {recordNotification && (
          <div className="record-modal-overlay" onClick={() => setRecordNotification(null)}>
            <div className="record-modal" onClick={e => e.stopPropagation()}>
              <div className="record-trophy">🏆</div>
              <h2>NOUVEAU RECORD !</h2>
              <p className="record-subtitle">
                Tu as battu {recordNotification.records.length > 1 ? 'tes records' : 'ton record'} personnel{recordNotification.records.length > 1 ? 's' : ''} !
              </p>
              <div className="record-list">
                {recordNotification.records.map((record, index) => (
                  <div key={index} className="record-item">
                    <div className="record-stat-name">{record.stat}</div>
                    <div className="record-values">
                      <span className="record-old">{record.old}</span>
                      <span className="record-arrow">→</span>
                      <span className="record-new">{record.value}</span>
                    </div>
                  </div>
                ))}
              </div>
              <button className="record-close-btn" onClick={() => setRecordNotification(null)}>
                Super ! 🎉
              </button>
            </div>
          </div>
        )}

        {/* Help Modal */}
        {showHelpModal && (
          <div className="help-modal-overlay" onClick={() => setShowHelpModal(false)}>
            <div className="help-modal" onClick={e => e.stopPropagation()}>
              <button className="help-close" onClick={() => setShowHelpModal(false)}>×</button>
              <h2>📖 Légende des Stats</h2>

              <div className="help-section">
                <h3>📊 Stats de base</h3>
                <div className="help-item">
                  <span className="help-term">PTS</span>
                  <span className="help-def">Points marqués (2pts × 2 + 3pts × 3 + LF)</span>
                </div>
                <div className="help-item">
                  <span className="help-term">LF +</span>
                  <span className="help-def">Lancers francs réussis</span>
                </div>
                <div className="help-item">
                  <span className="help-term">LF -</span>
                  <span className="help-def">Lancers francs ratés</span>
                </div>
                <div className="help-item">
                  <span className="help-term">REB OFF</span>
                  <span className="help-def">Rebonds offensifs (sur tir manqué de ton équipe)</span>
                </div>
                <div className="help-item">
                  <span className="help-term">REB DEF</span>
                  <span className="help-def">Rebonds défensifs (sur tir manqué adverse)</span>
                </div>
                <div className="help-item">
                  <span className="help-term">AST</span>
                  <span className="help-def">Assists / Passes décisives</span>
                </div>
                <div className="help-item">
                  <span className="help-term">STL</span>
                  <span className="help-def">Steals / Interceptions</span>
                </div>
                <div className="help-item">
                  <span className="help-term">BLK</span>
                  <span className="help-def">Blocks / Contres</span>
                </div>
                <div className="help-item">
                  <span className="help-term">FG%</span>
                  <span className="help-def">Field Goal % = Tirs réussis / Tirs tentés</span>
                </div>
              </div>

              <div className="help-section">
                <h3>📈 Stats avancées</h3>
                <div className="help-item">
                  <span className="help-term">+/-</span>
                  <span className="help-def">Plus/Minus : différentiel de points quand tu es sur le terrain. +10 = ton équipe a marqué 10 pts de plus que l'adversaire pendant ton temps de jeu.</span>
                </div>
                <div className="help-item">
                  <span className="help-term">TS%</span>
                  <span className="help-def">True Shooting % : efficacité globale au tir incluant 2pts, 3pts et LF. Formule : PTS / (2 × (Tirs + 0.44 × LF tentés)). Un bon TS% est &gt; 55%.</span>
                </div>
                <div className="help-item">
                  <span className="help-term">GmSc</span>
                  <span className="help-def">Game Score (John Hollinger) : note globale du match. 10 = match moyen, 20+ = excellent, 40+ = légendaire. Prend en compte toutes les stats positives et négatives.</span>
                </div>
              </div>

              <div className="help-section">
                <h3>🏆 Records</h3>
                <p className="help-text">Tes meilleurs scores personnels sur chaque stat. Quand tu bats un record, une notification apparaît !</p>
              </div>

              <div className="help-section">
                <h3>🎯 Cartes de tirs</h3>
                <div className="help-item">
                  <span className="help-term">Heatmap</span>
                  <span className="help-def">Carte des tirs avec positions exactes (vert = réussi, rouge = raté)</span>
                </div>
                <div className="help-item">
                  <span className="help-term">Zones</span>
                  <span className="help-def">Zones chaudes/froides selon ton % de réussite par zone</span>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </>
  )
}
