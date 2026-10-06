import { useState, useEffect, useRef } from 'react'
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

  .as-counter {
    text-align: center;
    font-size: 4.5rem;
    font-weight: 800;
    line-height: 1;
    margin: 10px 0 5px;
    color: var(--accent, #61dafb);
  }

  .as-buttons {
    display: grid;
    grid-template-columns: repeat(4, 1fr);
    gap: 8px;
  }

  .as-buttons .training-reset {
    margin-top: 0;
    font-size: 1.3rem;
    font-weight: bold;
  }

  .as-list {
    list-style: none;
    padding: 0;
    margin: 15px 0 0;
  }

  .as-list li {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 10px;
    border-bottom: 1px solid var(--border, rgba(255, 255, 255, 0.1));
  }

  .as-list li span:first-child {
    flex: 1;
  }

  .as-list button {
    background: none;
    border: none;
    color: var(--muted, #888);
    font-size: 1.1rem;
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

  .timeout-btn {
    background: rgba(241, 196, 15, 0.2);
    border: 1px solid rgba(241, 196, 15, 0.5);
    color: #f1c40f;
    padding: 6px 12px;
    border-radius: 20px;
    font-size: 0.8rem;
    cursor: pointer;
    font-weight: bold;
    animation: pulse 2s infinite;
  }

  .inactivity-warning {
    background: rgba(231, 76, 60, 0.15);
    border: 1px solid rgba(231, 76, 60, 0.4);
    border-radius: 10px;
    padding: 10px;
    text-align: center;
    color: #e74c3c;
    font-size: 0.85rem;
    font-weight: bold;
    animation: pulse 1.5s infinite;
    cursor: pointer;
  }

  .inactivity-actions {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-top: 8px;
  }

  .inactivity-actions button {
    padding: 6px 14px;
    border-radius: 8px;
    border: none;
    cursor: pointer;
    font-size: 0.8rem;
    font-weight: bold;
  }

  .inactivity-actions button:first-child {
    background: rgba(46, 204, 113, 0.3);
    color: #2ecc71;
  }

  .inactivity-actions button:last-child {
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

  /* Wide screen layout (Fold unfolded, tablet) - Court + Stats side by side */
  .match-body {
    display: flex;
    flex-direction: column;
  }

  @media screen and (min-width: 700px) {
    .match-body {
      flex-direction: row;
      gap: 10px;
      align-items: flex-start;
    }

    .match-body-court {
      flex: 1.2;
      min-width: 0;
      max-width: 55%;
      position: sticky;
      top: calc(10px + max(env(safe-area-inset-top), var(--safe-area-inset-top, 0px)));
    }

    .match-body-stats {
      flex: 1;
      min-width: 0;
    }

    .match-body-stats .quick-stats-grid {
      grid-template-columns: repeat(2, 1fr);
      gap: 6px;
    }

    .match-body-stats .quick-stat {
      padding: 6px 4px;
    }

    .match-body-stats .qs-controls button {
      width: 32px;
      height: 32px;
      font-size: 1.1rem;
    }

    .match-body-stats .qs-value {
      font-size: 0.85rem;
      min-width: 30px;
    }

    .match-body-stats .qs-label {
      font-size: 0.7rem;
    }

    .match-body-stats .stats-category-title {
      font-size: 0.75rem;
      margin-bottom: 4px;
    }

    .match-body-stats .stats-category {
      margin-bottom: 6px;
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

  /* Replay : une ligne par quart-temps affiché + une ligne match */
  .replay-stats { flex-direction: column; gap: 10px; }
  .replay-stats-row { display: flex; align-items: center; justify-content: space-between; gap: 8px; }
  .replay-stats-label { min-width: 48px; font-weight: 800; color: var(--accent, #61dafb); }

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

  .gist-action-btn.sync-btn {
    background: linear-gradient(135deg, rgba(46, 204, 113, 0.2) 0%, rgba(46, 204, 113, 0.1) 100%);
    border-color: #2ecc71;
    color: #2ecc71;
    flex: 2;
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

  .option-toggle {
    display: flex;
    justify-content: space-between;
    align-items: center;
    padding: 8px 0;
  }

  .option-toggle label {
    color: rgba(255, 255, 255, 0.8);
    font-size: 0.95rem;
  }

  .toggle-btn {
    padding: 6px 16px;
    border-radius: 20px;
    border: 1px solid rgba(255, 255, 255, 0.3);
    background: rgba(255, 255, 255, 0.1);
    color: rgba(255, 255, 255, 0.6);
    cursor: pointer;
    font-size: 0.85rem;
  }

  .toggle-btn.active {
    background: rgba(46, 204, 113, 0.2);
    border-color: #2ecc71;
    color: #2ecc71;
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

  /* ============================================================
     MODERNISATION 2026/2027 — couche de design par-dessus l'existant
     Tokens sur body (thème via body[data-theme]) ; sélecteurs préfixés
     par #root pour primer sur les anciennes règles (y compris thème clair).
     ============================================================ */
  body {
    --bg: #0b1018;
    --bg-glow: radial-gradient(1200px 600px at 50% -200px, rgba(255, 122, 26, 0.10), transparent 70%);
    --surface: #141b26;
    --surface-2: #1b2432;
    --border: rgba(255, 255, 255, 0.07);
    --text: #eef2f8;
    --muted: #8b97aa;
    --accent: #ff7a1a;
    --accent-soft: rgba(255, 122, 26, 0.14);
    --good: #22c55e;
    --bad: #f05252;
    --nav-bg: rgba(14, 19, 28, 0.88);
    --shadow: 0 1px 0 rgba(255, 255, 255, 0.03) inset, 0 8px 24px rgba(0, 0, 0, 0.25);
    --nav-h: 64px;
    background: var(--bg-glow), var(--bg);
    background-attachment: fixed;
    color: var(--text);
    font-family: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
    -webkit-font-smoothing: antialiased;
    -webkit-tap-highlight-color: transparent;
    padding: calc(12px + max(env(safe-area-inset-top), var(--safe-area-inset-top, 0px))) max(12px, env(safe-area-inset-right)) calc(var(--nav-h) + 24px + env(safe-area-inset-bottom)) max(12px, env(safe-area-inset-left));
  }
  body[data-theme="light"] {
    --bg: #f3f5f9;
    --surface: #ffffff;
    --surface-2: #eef1f6;
    --border: rgba(15, 23, 42, 0.08);
    --text: #111827;
    --muted: #5b6474;
    --accent: #ea580c;
    --accent-soft: rgba(234, 88, 12, 0.10);
    --good: #16a34a;
    --bad: #dc2626;
    --nav-bg: rgba(255, 255, 255, 0.9);
    --shadow: 0 1px 2px rgba(15, 23, 42, 0.06), 0 6px 18px rgba(15, 23, 42, 0.06);
    background: var(--bg-glow), var(--bg);
    color: var(--text);
  }

  /* En-tête */
  #root .app-header {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 12px;
    margin: 4px 2px 14px;
  }
  #root .app-header h1 {
    margin: 0;
    text-align: left;
    font-size: 1.3rem;
    font-weight: 800;
    letter-spacing: -0.02em;
    color: var(--text);
  }
  #root .app-season {
    display: inline-block;
    margin-left: 6px;
    padding: 2px 8px;
    border-radius: 999px;
    font-size: 0.75rem;
    font-weight: 700;
    vertical-align: middle;
    color: var(--accent);
    background: var(--accent-soft);
  }
  #root .help-btn {
    width: 36px;
    height: 36px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--muted);
    font-weight: 700;
    font-size: 1rem;
    flex-shrink: 0;
  }

  /* Barre d'onglets en bas (style app mobile) */
  #root .nav-tabs {
    position: fixed;
    left: 0;
    right: 0;
    bottom: 0;
    z-index: 100;
    margin: 0;
    gap: 0;
    display: flex;
    flex-wrap: nowrap;
    justify-content: center;
    padding: 6px max(8px, env(safe-area-inset-right)) calc(6px + env(safe-area-inset-bottom)) max(8px, env(safe-area-inset-left));
    background: var(--nav-bg);
    backdrop-filter: blur(16px);
    -webkit-backdrop-filter: blur(16px);
    border-top: 1px solid var(--border);
  }
  #root .nav-tab {
    flex: 1 1 0;
    min-width: 0;
    max-width: 120px;
    min-height: 52px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    padding: 4px 2px;
    border: none;
    border-radius: 12px;
    background: transparent;
    color: var(--muted);
    font-size: 0.68rem;
    font-weight: 600;
    white-space: nowrap;
    box-shadow: none;
    animation: none;
    transform: none;
    overflow: visible;
  }
  #root .nav-tab::after { display: none; }
  #root .nav-tab:hover { background: transparent; color: var(--text); transform: none; }
  #root .nav-icon {
    font-size: 1.25rem;
    line-height: 1;
    padding: 4px 14px;
    border-radius: 999px;
    transition: background 0.2s ease;
  }
  #root .nav-tab.active { color: var(--accent); background: transparent; box-shadow: none; }
  #root .nav-tab.active .nav-icon { background: var(--accent-soft); }
  #root .nav-badge {
    position: absolute;
    top: 2px;
    left: calc(50% + 8px);
    min-width: 18px;
    height: 18px;
    padding: 0 5px;
    border-radius: 999px;
    background: var(--accent);
    color: #fff;
    font-size: 0.65rem;
    font-weight: 700;
    line-height: 18px;
  }

  /* Cartes */
  #root .match-header-compact,
  #root .court-container,
  #root .points-total-display {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 18px;
    box-shadow: var(--shadow);
  }

  /* Bandeau timer + score collant en haut pendant le match */
  #root .match-header-compact {
    position: sticky;
    top: calc(8px + max(env(safe-area-inset-top), var(--safe-area-inset-top, 0px)));
    z-index: 50;
    padding: 10px 12px;
    backdrop-filter: blur(12px);
    -webkit-backdrop-filter: blur(12px);
  }
  #root .score-value {
    font-size: 1.9rem;
    font-weight: 800;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }
  #root .score-controls button {
    width: 40px;
    height: 40px;
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font-size: 1.2rem;
  }
  #root .score-label { color: var(--muted); font-weight: 600; }

  /* Tuiles de stats : on tape la tuile = +1, petit bouton − en coin */
  #root .stats-category { margin-bottom: 10px; }
  #root .stats-category-title {
    background: none;
    border: none;
    padding: 0 2px;
    margin: 6px 0;
    color: var(--muted);
    font-size: 0.7rem;
    font-weight: 700;
    letter-spacing: 0.08em;
  }
  #root .quick-stats-grid { gap: 8px; }
  #root .quick-stat {
    position: relative;
    padding: 0;
    border-radius: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
    overflow: hidden;
  }
  #root .qs-tap {
    width: 100%;
    min-height: 76px;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 4px;
    padding: 10px 4px;
    border: none;
    background: transparent;
    color: var(--text);
    cursor: pointer;
    touch-action: manipulation;
    transition: background 0.12s ease, transform 0.12s ease;
  }
  #root .qs-tap:active { background: var(--accent-soft); transform: scale(0.96); }
  #root .qs-label {
    font-size: 0.68rem;
    font-weight: 700;
    letter-spacing: 0.04em;
    text-transform: uppercase;
    color: var(--muted);
  }
  #root .qs-value {
    font-size: 1.6rem;
    font-weight: 800;
    line-height: 1;
    font-variant-numeric: tabular-nums;
    color: var(--text);
  }
  #root .qs-positive .qs-label { color: var(--good); }
  #root .qs-negative .qs-label { color: var(--bad); }
  #root .qs-minus {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 26px;
    height: 26px;
    padding: 0;
    border-radius: 50%;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--muted);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  #root .qs-minus:active { color: var(--bad); }

  /* Total points */
  #root .points-total-display {
    background: linear-gradient(135deg, var(--accent-soft), transparent 60%), var(--surface);
  }
  #root .pts-label { color: var(--muted); font-weight: 700; letter-spacing: 0.08em; }
  #root .pts-value { color: var(--accent); font-weight: 800; font-variant-numeric: tabular-nums; }

  /* Bouton Annuler flottant : au-dessus de la barre d'onglets */
  #root .undo-floating {
    bottom: calc(var(--nav-h) + 12px + env(safe-area-inset-bottom));
    border-radius: 14px;
  }

  /* Sélecteurs (saison, match) */
  #root .match-select {
    border-radius: 12px;
    border: 1px solid var(--border);
    background: var(--surface);
    color: var(--text);
  }

  @media (min-width: 700px) {
    #root .app-header h1 { font-size: 1.6rem; }
  }

  /* ============================================================
     BROADCAST — style retransmission sportive (par-dessus MODERNISATION)
     ============================================================ */
  body {
    --font-display: 'Barlow Condensed', system-ui, sans-serif;
    --grad: linear-gradient(120deg, #ff8a1f 0%, #ff3d6e 55%, #8b5cf6 100%);
    --grad-good: linear-gradient(135deg, #22c55e, #10b981);
    --grad-bad: linear-gradient(135deg, #f43f5e, #e11d48);
    --glow: 0 0 0 1px rgba(255, 122, 26, 0.25), 0 10px 30px rgba(255, 61, 110, 0.18);
    --bg-glow: radial-gradient(900px 500px at 15% -150px, rgba(255, 122, 26, 0.16), transparent 70%),
               radial-gradient(800px 500px at 100% -100px, rgba(139, 92, 246, 0.14), transparent 70%);
  }
  body[data-theme="light"] {
    --glow: 0 0 0 1px rgba(234, 88, 12, 0.2), 0 10px 30px rgba(234, 88, 12, 0.12);
    --bg-glow: radial-gradient(900px 500px at 15% -150px, rgba(255, 122, 26, 0.12), transparent 70%),
               radial-gradient(800px 500px at 100% -100px, rgba(139, 92, 246, 0.10), transparent 70%);
  }

  /* Typo display : titres et chiffres en condensé */
  #root h1, #root h2, #root h3,
  #root .stats-category-title,
  #root .qs-value, #root .qs-label,
  #root .pts-value, #root .pts-label,
  #root .nav-label {
    font-family: var(--font-display);
  }
  #root h2, #root h3 { letter-spacing: 0.01em; text-transform: uppercase; }
  #root .app-header h1 { font-size: 1.6rem; font-weight: 800; text-transform: uppercase; letter-spacing: 0.01em; }
  #root .app-season { background: var(--grad); color: #fff; font-family: var(--font-display); font-size: 0.85rem; }
  #root .nav-label { font-size: 0.8rem; font-weight: 700; letter-spacing: 0.04em; text-transform: uppercase; }
  #root .nav-tab.active .nav-icon { background: var(--grad); box-shadow: 0 4px 14px rgba(255, 61, 110, 0.35); }
  #root .nav-tab.active { color: var(--text); }
  #root .nav-badge { background: var(--grad); }

  /* ---------- Scoreboard ---------- */
  #root .scoreboard {
    padding: 0;
    overflow: hidden;
    background:
      linear-gradient(180deg, rgba(255, 255, 255, 0.04), transparent 40%),
      var(--surface);
    box-shadow: var(--shadow), var(--glow);
  }
  #root .scoreboard::before {
    content: '';
    display: block;
    height: 3px;
    background: var(--grad);
  }
  #root .sb-top {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px 0;
  }
  #root .sb-quarter {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1rem;
    padding: 2px 8px;
    border-radius: 6px;
    background: var(--text);
    color: var(--bg);
  }
  #root .sb-time {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 1.6rem;
    font-variant-numeric: tabular-nums;
    letter-spacing: 0.02em;
    color: var(--muted);
  }
  #root .sb-time.running { color: var(--text); }
  #root .sb-play {
    width: 34px;
    height: 34px;
    border-radius: 50%;
    border: none;
    background: var(--grad);
    color: #fff;
    font-size: 0.9rem;
    cursor: pointer;
    box-shadow: 0 4px 12px rgba(255, 61, 110, 0.35);
  }
  #root .sb-live, #root .sb-paused {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 0.85rem;
    letter-spacing: 0.08em;
    display: inline-flex;
    align-items: center;
    gap: 5px;
  }
  #root .sb-live { color: #f43f5e; }
  #root .sb-paused { color: var(--muted); }
  #root .sb-live-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: #f43f5e;
    animation: sb-pulse 1.2s ease-in-out infinite;
  }
  @keyframes sb-pulse {
    0%, 100% { box-shadow: 0 0 0 0 rgba(244, 63, 94, 0.7); }
    50% { box-shadow: 0 0 0 6px rgba(244, 63, 94, 0); }
  }
  #root .sb-court {
    margin-left: auto;
    border: 1px solid var(--border);
    border-radius: 999px;
    padding: 5px 10px;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.95rem;
    font-variant-numeric: tabular-nums;
    cursor: pointer;
  }
  #root .sb-court.on-court { background: rgba(34, 197, 94, 0.15); color: var(--good); }
  #root .sb-court.on-bench { background: var(--surface-2); color: var(--muted); }
  #root .scoreboard .timeout-btn { margin: 8px 12px 0; }
  #root .scoreboard .inactivity-warning { margin: 8px 12px 0; }

  #root .sb-score {
    display: grid;
    grid-template-columns: 1fr auto 1fr;
    align-items: center;
    padding: 4px 12px 6px;
  }
  #root .sb-team {
    display: grid;
    grid-template-columns: auto 1fr;
    grid-template-rows: auto auto;
    align-items: center;
    column-gap: 8px;
  }
  #root .sb-team.them { grid-template-columns: 1fr auto; text-align: right; }
  #root .sb-team-label {
    grid-column: 1 / -1;
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.8rem;
    letter-spacing: 0.14em;
    color: var(--muted);
  }
  #root .sb-score-value {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 3.4rem;
    line-height: 0.95;
    font-variant-numeric: tabular-nums;
  }
  #root .sb-team.us .sb-score-value {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
  }
  #root .sb-team.them .sb-score-value { order: 2; color: var(--text); }
  #root .sb-team.them .sb-score-btns { order: 1; }
  #root .sb-score-btns { display: flex; flex-direction: column; gap: 4px; }
  #root .sb-score-btns button {
    width: 34px;
    height: 26px;
    border-radius: 8px;
    border: 1px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    font-size: 1rem;
    line-height: 1;
    cursor: pointer;
  }
  #root .sb-team.them .sb-score-btns { align-items: flex-end; }
  #root .sb-diff {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.1rem;
    padding: 2px 10px;
    border-radius: 999px;
    background: var(--surface-2);
    color: var(--muted);
  }
  #root .sb-diff.up { color: var(--good); background: rgba(34, 197, 94, 0.14); }
  #root .sb-diff.down { color: var(--bad); background: rgba(244, 63, 94, 0.14); }

  #root .sb-player {
    display: flex;
    align-items: center;
    gap: 10px;
    padding: 8px 12px;
    border-top: 1px solid var(--border);
    background: rgba(255, 255, 255, 0.02);
  }
  #root .sb-player-id { display: flex; flex-direction: column; line-height: 1.05; }
  #root .sb-player-name {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.05rem;
    text-transform: uppercase;
  }
  #root .sb-player-number { font-family: var(--font-display); font-weight: 700; color: var(--accent); font-size: 0.85rem; }
  #root .sb-pts { display: flex; align-items: baseline; gap: 4px; margin-left: 4px; }
  #root .sb-pts-value {
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 2rem;
    line-height: 1;
    font-variant-numeric: tabular-nums;
  }
  #root .sb-pts-label { font-family: var(--font-display); font-weight: 700; color: var(--muted); font-size: 0.85rem; }
  #root .sb-pts.hot .sb-pts-value {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    filter: drop-shadow(0 0 8px rgba(255, 61, 110, 0.45));
  }
  #root .sb-streak { font-family: var(--font-display); font-weight: 800; color: #ff8a1f; font-size: 0.95rem; }
  #root .sb-mini {
    margin-left: auto;
    display: flex;
    gap: 10px;
    font-family: var(--font-display);
    font-weight: 600;
    font-size: 0.8rem;
    color: var(--muted);
    letter-spacing: 0.04em;
  }
  #root .sb-mini b { color: var(--text); font-size: 1.05rem; font-weight: 800; margin-right: 2px; }

  /* ---------- Panneau tirs ---------- */
  #root .shots-panel {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
  }
  #root .shot-col {
    display: flex;
    flex-direction: column;
    gap: 6px;
    padding: 10px 8px 8px;
    border-radius: 16px;
    background: var(--surface);
    border: 1px solid var(--border);
    box-shadow: var(--shadow);
  }
  #root .shot-head { display: flex; align-items: baseline; justify-content: space-between; gap: 4px; }
  #root .shot-name { font-family: var(--font-display); font-weight: 800; font-size: 1.1rem; letter-spacing: 0.02em; }
  #root .shot-line { font-family: var(--font-display); font-weight: 700; font-size: 1.05rem; font-variant-numeric: tabular-nums; }
  #root .shot-pct {
    font-family: var(--font-display);
    font-weight: 700;
    font-size: 0.8rem;
    color: var(--muted);
    margin-top: -4px;
  }
  #root .shot-btn-wrap { position: relative; }
  #root .sp-btn {
    width: 100%;
    min-height: 58px;
    border: none;
    border-radius: 12px;
    font-size: 1.6rem;
    font-weight: 800;
    cursor: pointer;
    touch-action: manipulation;
    transition: transform 0.1s ease, filter 0.1s ease;
  }
  #root .sp-btn.made { background: var(--grad-good); color: #fff; box-shadow: 0 6px 16px rgba(34, 197, 94, 0.28); }
  #root .sp-btn.missed { background: transparent; color: var(--bad); border: 2px solid rgba(244, 63, 94, 0.45); box-shadow: none; }
  #root .sp-btn:active { transform: scale(0.94); filter: brightness(1.15); }
  #root .shot-btn-wrap .qs-minus { top: 4px; right: 4px; width: 22px; height: 22px; font-size: 0.85rem; }
  #root .sp-btn.made + .qs-minus { background: rgba(0, 0, 0, 0.18); border-color: transparent; color: #fff; }

  /* ---------- Tuiles actions ---------- */
  #root .actions-grid { grid-template-columns: repeat(4, 1fr); }
  #root .actions-grid .qs-tap { min-height: 74px; padding: 8px 2px 14px; }
  #root .actions-grid .qs-minus { top: auto; bottom: 4px; right: 4px; width: 22px; height: 22px; font-size: 0.85rem; }
  #root .qs-label { font-size: 0.8rem; letter-spacing: 0.06em; }
  #root .qs-value { font-size: 1.9rem; }
  #root .quick-stat:has(.qs-tap:active) { box-shadow: var(--glow); }
  #root .stats-category-title { font-size: 0.85rem; letter-spacing: 0.14em; }
  #root .stats-category-title::before {
    content: '';
    display: inline-block;
    width: 14px;
    height: 3px;
    margin-right: 6px;
    vertical-align: middle;
    border-radius: 2px;
    background: var(--grad);
  }

  /* Total points : redondant avec le scoreboard, version compacte */
  #root .points-total-display { padding: 10px 14px; }
  #root .pts-value {
    background: var(--grad);
    -webkit-background-clip: text;
    background-clip: text;
    color: transparent;
    font-size: 2rem;
  }

  /* Sur mobile : boutons de saisie avant la carte du terrain */
  #root .match-body { display: flex; flex-direction: column; }
  #root .match-body-stats { order: 1; }
  #root .match-body-court { order: 2; margin-top: 10px; }
  @media (min-width: 700px) {
    #root .match-body { flex-direction: row; }
    #root .match-body-court { order: 0; margin-top: 0; }
    #root .match-body-stats { order: 0; }
  }

  /* ---------- Animations ---------- */
  #root .bump { display: inline-block; animation: bump 0.35s cubic-bezier(0.34, 1.56, 0.64, 1); }
  @keyframes bump {
    0% { transform: scale(1.35); }
    100% { transform: scale(1); }
  }
  .pop-layer { position: fixed; inset: 0; pointer-events: none; z-index: 2000; }
  .pop {
    position: fixed;
    transform: translate(-50%, -50%);
    font-family: var(--font-display);
    font-weight: 800;
    font-size: 1.8rem;
    animation: pop-up 0.8s ease-out forwards;
    text-shadow: 0 4px 14px rgba(0, 0, 0, 0.35);
  }
  .pop.good { color: #22c55e; }
  .pop.bad { color: #f43f5e; }
  @keyframes pop-up {
    0% { opacity: 0; transform: translate(-50%, -30%) scale(0.6); }
    20% { opacity: 1; transform: translate(-50%, -80%) scale(1.15); }
    100% { opacity: 0; transform: translate(-50%, -260%) scale(1); }
  }

  /* ============================================================
     CARTOON — style BD (par-dessus BROADCAST) : contours encre,
     ombres décalées, couleurs flashy, trame de points, police Bangers
     ============================================================ */
  body[data-skin="cartoon"] {
    --font-display: 'Bangers', 'Barlow Condensed', system-ui, sans-serif;
    --ink: #120b2e;
    --bg: #23175a;
    --surface: #33247a;
    --surface-2: #45339a;
    --text: #ffffff;
    --muted: #cfc6ff;
    --border: var(--ink);
    --c-yellow: #ffd23f;
    --c-orange: #ff7b1c;
    --c-pink: #ff4fa3;
    --c-cyan: #2ee6d6;
    --c-green: #3ddc84;
    --c-red: #ff4757;
    --c-violet: #8b5cf6;
    --accent: var(--c-yellow);
    --accent-soft: rgba(255, 210, 63, 0.18);
    --good: var(--c-green);
    --bad: var(--c-red);
    --grad: linear-gradient(135deg, var(--c-yellow), var(--c-orange) 50%, var(--c-pink));
    --nav-bg: var(--surface);
    --shadow: 4px 4px 0 var(--ink);
    --glow: 4px 4px 0 var(--ink);
    --dots: rgba(255, 255, 255, 0.07);
    background:
      radial-gradient(var(--dots) 1.6px, transparent 1.7px) 0 0 / 16px 16px,
      radial-gradient(900px 500px at 10% -120px, rgba(255, 79, 163, 0.35), transparent 70%),
      radial-gradient(800px 500px at 100% 0, rgba(46, 230, 214, 0.22), transparent 70%),
      var(--bg);
    background-attachment: fixed;
  }
  body[data-skin="cartoon"][data-theme="light"] {
    --ink: #1a1033;
    --bg: #fff1c9;
    --surface: #ffffff;
    --surface-2: #ffe7a0;
    --text: #1a1033;
    --muted: #6b5a8e;
    --accent: var(--c-orange);
    --accent-soft: rgba(255, 123, 28, 0.15);
    --nav-bg: #ffffff;
    --dots: rgba(26, 16, 51, 0.09);
    background:
      radial-gradient(var(--dots) 1.6px, transparent 1.7px) 0 0 / 16px 16px,
      radial-gradient(900px 500px at 10% -120px, rgba(255, 79, 163, 0.18), transparent 70%),
      radial-gradient(800px 500px at 100% 0, rgba(46, 230, 214, 0.18), transparent 70%),
      var(--bg);
  }

  /* Texte BD : contour + ombre */
  body[data-skin="cartoon"] #root h1,
  body[data-skin="cartoon"] #root h2,
  body[data-skin="cartoon"] #root h3 { font-weight: 400; letter-spacing: 0.04em; }
  body[data-skin="cartoon"] #root .app-header h1 {
    font-size: 2rem;
    font-weight: 400;
    color: var(--c-yellow);
    -webkit-text-stroke: 1.5px var(--ink);
    text-shadow: 3px 3px 0 var(--ink);
    transform: rotate(-2deg);
  }
  body[data-skin="cartoon"] #root .app-season {
    background: var(--c-pink);
    color: #fff;
    border: 2.5px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    font-size: 1rem;
    letter-spacing: 0.06em;
    -webkit-text-stroke: 0;
    text-shadow: none;
    transform: rotate(3deg);
  }
  body[data-skin="cartoon"] #root .help-btn {
    background: var(--c-cyan);
    color: var(--ink);
    border: 3px solid var(--ink);
    box-shadow: 3px 3px 0 var(--ink);
    font-family: var(--font-display);
    font-size: 1.3rem;
  }

  /* Cartes : contour encre + ombre décalée */
  body[data-skin="cartoon"] #root .match-header-compact,
  body[data-skin="cartoon"] #root .court-container,
  body[data-skin="cartoon"] #root .points-total-display,
  body[data-skin="cartoon"] #root .quick-stat,
  body[data-skin="cartoon"] #root .shot-col {
    border: 3px solid var(--ink);
    box-shadow: 5px 5px 0 var(--ink);
    border-radius: 18px;
  }

  /* Étiquettes de section façon sticker */
  body[data-skin="cartoon"] #root .stats-category-title {
    display: inline-block;
    padding: 3px 12px;
    margin: 10px 0 10px 2px;
    font-size: 1.15rem;
    letter-spacing: 0.08em;
    color: var(--ink);
    background: var(--c-yellow);
    border: 2.5px solid var(--ink);
    border-radius: 8px;
    box-shadow: 3px 3px 0 var(--ink);
    transform: rotate(-2deg);
  }
  body[data-skin="cartoon"] #root .stats-category-title::before { display: none; }

  /* ---------- Scoreboard ---------- */
  body[data-skin="cartoon"] #root .scoreboard {
    background:
      radial-gradient(rgba(18, 11, 46, 0.12) 1.4px, transparent 1.5px) 0 0 / 12px 12px,
      var(--c-yellow);
    color: var(--ink);
    box-shadow: 6px 6px 0 var(--ink);
    --text: #120b2e;
    --muted: #4a3d7a;
    --surface-2: #fff;
    --border: var(--ink);
  }
  body[data-skin="cartoon"] #root .scoreboard::before { height: 0; }
  body[data-skin="cartoon"] #root .sb-quarter { background: var(--ink); color: var(--c-yellow); font-weight: 400; font-size: 1.2rem; transform: rotate(-4deg); }
  body[data-skin="cartoon"] #root .sb-time { color: var(--ink); font-size: 1.9rem; font-weight: 400; letter-spacing: 0.06em; }
  body[data-skin="cartoon"] #root .sb-time.running { color: var(--ink); }
  body[data-skin="cartoon"] #root .sb-play { background: var(--c-pink); border: 3px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); width: 38px; height: 38px; }
  body[data-skin="cartoon"] #root .sb-live {
    color: #fff;
    background: var(--c-red);
    padding: 2px 8px;
    border: 2.5px solid var(--ink);
    border-radius: 8px;
    font-weight: 400;
    font-size: 1rem;
    animation: live-wiggle 1s ease-in-out infinite;
  }
  body[data-skin="cartoon"] #root .sb-live-dot { background: #fff; }
  @keyframes live-wiggle {
    0%, 100% { transform: rotate(-3deg); }
    50% { transform: rotate(3deg) scale(1.06); }
  }
  body[data-skin="cartoon"] #root .sb-paused { color: var(--ink); font-weight: 400; font-size: 1rem; opacity: 0.6; }
  body[data-skin="cartoon"] #root .sb-court { border: 2.5px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); font-weight: 400; font-size: 1.05rem; }
  body[data-skin="cartoon"] #root .sb-court.on-court { background: var(--c-green); color: var(--ink); }
  body[data-skin="cartoon"] #root .sb-court.on-bench { background: #fff; color: var(--ink); }
  body[data-skin="cartoon"] #root .scoreboard .timeout-btn { border: 2.5px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); background: #fff; color: var(--ink); font-family: var(--font-display); font-size: 1.05rem; letter-spacing: 0.04em; }

  body[data-skin="cartoon"] #root .sb-team-label { color: var(--ink); font-weight: 400; font-size: 1rem; letter-spacing: 0.12em; }
  body[data-skin="cartoon"] #root .sb-score-value {
    font-weight: 400;
    font-size: 4rem;
    line-height: 0.9;
    -webkit-text-stroke: 2.5px var(--ink);
    text-shadow: 4px 4px 0 var(--ink);
  }
  body[data-skin="cartoon"] #root .sb-team.us .sb-score-value { background: none; -webkit-background-clip: border-box; background-clip: border-box; color: var(--c-orange); }
  body[data-skin="cartoon"] #root .sb-team.them .sb-score-value { color: var(--c-cyan); }
  body[data-skin="cartoon"] #root .sb-score-btns button { border: 2.5px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); background: #fff; color: var(--ink); font-weight: 800; }
  body[data-skin="cartoon"] #root .sb-score-btns button:active { transform: translate(2px, 2px); box-shadow: none; }
  body[data-skin="cartoon"] #root .sb-diff { border: 2.5px solid var(--ink); background: #fff; color: var(--ink); font-weight: 400; font-size: 1.3rem; transform: rotate(-4deg); }
  body[data-skin="cartoon"] #root .sb-diff.up { background: var(--c-green); color: var(--ink); }
  body[data-skin="cartoon"] #root .sb-diff.down { background: var(--c-red); color: #fff; }

  body[data-skin="cartoon"] #root .sb-player { border-top: 3px solid var(--ink); background: #fff; }
  body[data-skin="cartoon"] #root .sb-player-name { font-weight: 400; font-size: 1.3rem; letter-spacing: 0.04em; color: var(--ink); }
  body[data-skin="cartoon"] #root .sb-player-number { color: var(--c-pink); font-weight: 400; font-size: 1rem; }
  body[data-skin="cartoon"] #root .sb-pts-value { font-weight: 400; font-size: 2.4rem; color: var(--c-orange); -webkit-text-stroke: 1.5px var(--ink); text-shadow: 2px 2px 0 var(--ink); }
  body[data-skin="cartoon"] #root .sb-pts.hot .sb-pts-value { background: none; color: var(--c-red); filter: none; animation: hot-shake 0.5s ease-in-out infinite; }
  @keyframes hot-shake {
    0%, 100% { transform: rotate(-4deg) scale(1.05); }
    50% { transform: rotate(4deg) scale(1.12); }
  }
  body[data-skin="cartoon"] #root .sb-pts-label,
  body[data-skin="cartoon"] #root .sb-mini { color: var(--ink); font-weight: 400; letter-spacing: 0.06em; }
  body[data-skin="cartoon"] #root .sb-mini b { font-weight: 400; font-size: 1.3rem; }
  body[data-skin="cartoon"] #root .sb-streak { font-weight: 400; font-size: 1.2rem; color: var(--c-red); }

  /* Tremblement (tir raté) */
  body[data-skin="cartoon"] #root .scoreboard.shake { animation: board-shake 0.45s cubic-bezier(0.36, 0.07, 0.19, 0.97); }
  @keyframes board-shake {
    10%, 90% { transform: translateX(-2px) rotate(-0.5deg); }
    20%, 80% { transform: translateX(4px) rotate(0.5deg); }
    30%, 50%, 70% { transform: translateX(-7px) rotate(-1deg); }
    40%, 60% { transform: translateX(7px) rotate(1deg); }
  }

  /* ---------- Tirs ---------- */
  body[data-skin="cartoon"] #root .shot-col { background: var(--surface); padding: 10px 8px 10px; }
  body[data-skin="cartoon"] #root .shot-name { font-weight: 400; font-size: 1.4rem; letter-spacing: 0.04em; }
  body[data-skin="cartoon"] #root .shot-line { font-weight: 400; font-size: 1.3rem; }
  body[data-skin="cartoon"] #root .shot-pct { font-family: var(--font-display); font-weight: 400; font-size: 1rem; color: var(--muted); letter-spacing: 0.04em; }
  body[data-skin="cartoon"] #root .sp-btn {
    font-family: var(--font-display);
    font-size: 2rem;
    border: 3px solid var(--ink);
    box-shadow: 4px 4px 0 var(--ink);
    transition: transform 0.08s ease, box-shadow 0.08s ease;
  }
  body[data-skin="cartoon"] #root .sp-btn.made { background: var(--c-green); color: var(--ink); box-shadow: 4px 4px 0 var(--ink); }
  body[data-skin="cartoon"] #root .sp-btn.missed { background: var(--c-red); color: #fff; border: 3px solid var(--ink); box-shadow: 4px 4px 0 var(--ink); }
  body[data-skin="cartoon"] #root .sp-btn:active { transform: translate(4px, 4px) scale(0.97, 0.9); box-shadow: 0 0 0 var(--ink); filter: none; }
  body[data-skin="cartoon"] #root .sp-btn.made + .qs-minus,
  body[data-skin="cartoon"] #root .shot-btn-wrap .qs-minus { background: #fff; color: var(--ink); border: 2px solid var(--ink); }

  /* ---------- Tuiles actions : une couleur par stat ---------- */
  body[data-skin="cartoon"] #root .quick-stat { overflow: visible; transition: transform 0.08s ease, box-shadow 0.08s ease; }
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(1),
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(2) { background: var(--c-cyan); }
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(3) { background: var(--c-yellow); }
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(4) { background: var(--c-green); }
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(5) { background: var(--c-pink); }
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(6),
  body[data-skin="cartoon"] #root .actions-grid .quick-stat:nth-child(7) { background: #ff8a8a; }
  body[data-skin="cartoon"] #root .actions-grid .qs-label,
  body[data-skin="cartoon"] #root .actions-grid .qs-value { color: var(--ink); }
  body[data-skin="cartoon"] #root .actions-grid .qs-negative .qs-label { color: var(--ink); }
  body[data-skin="cartoon"] #root .qs-label { font-weight: 400; font-size: 1rem; letter-spacing: 0.05em; }
  body[data-skin="cartoon"] #root .qs-value { font-weight: 400; font-size: 2.3rem; }
  body[data-skin="cartoon"] #root .qs-tap:active { background: transparent; transform: none; }
  body[data-skin="cartoon"] #root .quick-stat:has(.qs-tap:active) { transform: translate(4px, 4px) scale(0.97, 0.92); box-shadow: 0 0 0 var(--ink); }
  body[data-skin="cartoon"] #root .qs-minus { background: #fff; color: var(--ink); border: 2px solid var(--ink); font-weight: 800; }

  /* Total + carte */
  body[data-skin="cartoon"] #root .points-total-display { background: var(--surface); }
  body[data-skin="cartoon"] #root .pts-value { background: none; -webkit-background-clip: border-box; background-clip: border-box; color: var(--c-yellow); -webkit-text-stroke: 1.5px var(--ink); text-shadow: 3px 3px 0 var(--ink); font-weight: 400; font-size: 2.4rem; }
  body[data-skin="cartoon"] #root .pts-label { font-weight: 400; font-size: 1.1rem; }
  body[data-skin="cartoon"] #root .court-container { background: var(--surface); }

  /* ---------- Barre d'onglets ---------- */
  body[data-skin="cartoon"] #root .nav-tabs { border-top: 3px solid var(--ink); backdrop-filter: none; -webkit-backdrop-filter: none; }
  body[data-skin="cartoon"] #root .nav-label { font-weight: 400; font-size: 0.95rem; letter-spacing: 0.06em; }
  body[data-skin="cartoon"] #root .nav-tab.active { color: var(--text); }
  body[data-skin="cartoon"] #root .nav-tab.active .nav-icon {
    background: var(--c-yellow);
    border: 2.5px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    animation: tab-boing 0.4s cubic-bezier(0.34, 1.8, 0.64, 1);
  }
  @keyframes tab-boing {
    0% { transform: scale(0.6) rotate(-10deg); }
    100% { transform: scale(1) rotate(0); }
  }
  body[data-skin="cartoon"] #root .nav-badge { background: var(--c-pink); border: 2px solid var(--ink); }
  body[data-skin="cartoon"] #root .match-select { border: 3px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); }

  /* ---------- Animations BD ---------- */
  body[data-skin="cartoon"] #root .bump { animation: cartoon-bump 0.45s cubic-bezier(0.34, 1.8, 0.64, 1); }
  @keyframes cartoon-bump {
    0% { transform: scale(1.6) rotate(-8deg); }
    60% { transform: scale(0.92) rotate(3deg); }
    100% { transform: scale(1) rotate(0); }
  }

  /* Les écrans tactiles imposent 44px mini à tous les boutons (règle pointer: coarse plus haut) :
     on l'annule pour les petits boutons, sinon ils recouvrent les chiffres */
  #root .qs-minus, #root .sb-score-btns button, #root .help-btn, #root .edit-btn, #root .delete-btn { min-width: 0; min-height: 0; }

  /* Bulle BD en étoile */
  body[data-skin="cartoon"] .pop {
    font-family: 'Bangers', system-ui, sans-serif;
    font-weight: 400;
    font-size: 2rem;
    letter-spacing: 0.04em;
    white-space: nowrap;
    padding: 22px 26px;
    color: #fff;
    -webkit-text-stroke: 1.5px #120b2e;
    text-shadow: 3px 3px 0 #120b2e;
    animation: comic-pop 0.9s cubic-bezier(0.34, 1.6, 0.64, 1) forwards;
    isolation: isolate;
  }
  body[data-skin="cartoon"] .pop::before {
    content: '';
    position: absolute;
    inset: 0;
    z-index: -1;
    background: var(--burst, #ffd23f);
    filter: drop-shadow(3px 3px 0 #120b2e);
    clip-path: polygon(50% 0%, 61% 22%, 85% 8%, 78% 33%, 100% 38%, 82% 55%, 98% 75%, 72% 72%, 70% 100%, 52% 80%, 32% 98%, 30% 74%, 4% 82%, 18% 58%, 0% 40%, 22% 32%, 14% 8%, 38% 22%);
  }
  body[data-skin="cartoon"] .pop.good { --burst: #3ddc84; }
  body[data-skin="cartoon"] .pop.gold { --burst: #ffd23f; }
  body[data-skin="cartoon"] .pop.bad { --burst: #ff4757; }
  body[data-skin="cartoon"] .pop.cyan { --burst: #2ee6d6; }
  body[data-skin="cartoon"] .pop.pink { --burst: #ff4fa3; }
  body[data-skin="cartoon"] .pop.good,
  body[data-skin="cartoon"] .pop.gold,
  body[data-skin="cartoon"] .pop.bad,
  body[data-skin="cartoon"] .pop.cyan,
  body[data-skin="cartoon"] .pop.pink { color: #fff; }
  body[data-skin="cartoon"] .pop.small { font-size: 1.4rem; padding: 12px 16px; }
  @keyframes comic-pop {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(var(--rot, 0deg)); }
    25% { opacity: 1; transform: translate(-50%, -90%) scale(1.25) rotate(var(--rot, 0deg)); }
    45% { transform: translate(-50%, -95%) scale(0.95) rotate(var(--rot, 0deg)); }
    75% { opacity: 1; transform: translate(-50%, -110%) scale(1) rotate(var(--rot, 0deg)); }
    100% { opacity: 0; transform: translate(-50%, -150%) scale(0.8) rotate(var(--rot, 0deg)); }
  }

  /* Confettis (3 points) */
  .confetti {
    position: fixed;
    width: 10px;
    height: 14px;
    border: 2px solid #120b2e;
    border-radius: 3px;
    transform: translate(-50%, -50%);
    animation: confetti-fly 1s cubic-bezier(0.2, 0.7, 0.4, 1) forwards;
  }
  @keyframes confetti-fly {
    0% { opacity: 1; transform: translate(-50%, -50%) rotate(0) scale(0.4); }
    70% { opacity: 1; }
    100% { opacity: 0; transform: translate(calc(-50% + var(--dx)), calc(-50% + var(--dy) + 80px)) rotate(var(--r)) scale(1); }
  }

  /* Bandeau "EN FEU" */
  .fire-banner {
    position: fixed;
    left: 50%;
    top: 42%;
    padding: 10px 26px;
    font-family: var(--font-display);
    font-size: 3rem;
    letter-spacing: 0.05em;
    white-space: nowrap;
    color: #fff;
    text-shadow: 0 3px 12px rgba(0, 0, 0, 0.35);
    background: var(--grad);
    border-radius: 14px;
    box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
    animation: fire-in 1.6s cubic-bezier(0.34, 1.6, 0.64, 1) forwards;
  }
  @keyframes fire-in {
    0% { opacity: 0; transform: translate(-50%, -50%) scale(0.2) rotate(-20deg); }
    18% { opacity: 1; transform: translate(-50%, -50%) scale(1.15) rotate(-6deg); }
    30% { transform: translate(-50%, -50%) scale(1) rotate(-4deg); }
    80% { opacity: 1; transform: translate(-50%, -50%) scale(1.04) rotate(-4deg); }
    100% { opacity: 0; transform: translate(-50%, -80%) scale(0.9) rotate(-4deg); }
  }

  body[data-skin="cartoon"] .fire-banner {
    font-family: 'Bangers', system-ui, sans-serif;
    color: #ffd23f;
    -webkit-text-stroke: 2px #120b2e;
    text-shadow: 4px 4px 0 #120b2e;
    background: #ff4757;
    border: 4px solid #120b2e;
    box-shadow: 8px 8px 0 #120b2e;
  }

  /* ============================================================
     CARTOON — AUTRES ONGLETS (Historique, Entraînement, Analyse,
     Options, bas de l'écran Match, fenêtres)
     ============================================================ */

  /* Grands panneaux */
  body[data-skin="cartoon"] #root .analysis-filter,
  body[data-skin="cartoon"] #root .history-filter,
  body[data-skin="cartoon"] #root .detailed-stats-section,
  body[data-skin="cartoon"] #root .shooting-stats,
  body[data-skin="cartoon"] #root .averages-inline,
  body[data-skin="cartoon"] #root .records-inline,
  body[data-skin="cartoon"] #root .rolling-averages,
  body[data-skin="cartoon"] #root .goals-section,
  body[data-skin="cartoon"] #root .compare-view,
  body[data-skin="cartoon"] #root .quarter-stats-display,
  body[data-skin="cartoon"] #root .playing-time-display,
  body[data-skin="cartoon"] #root .match-card,
  body[data-skin="cartoon"] #root .chart-container,
  body[data-skin="cartoon"] #root .options-section,
  body[data-skin="cartoon"] #root .timer-section,
  body[data-skin="cartoon"] #root .playing-time-section,
  body[data-skin="cartoon"] #root .quarter-stats-section,
  body[data-skin="cartoon"] #root .summary,
  body[data-skin="cartoon"] #root .save-match-section {
    background: var(--surface);
    border: 3px solid var(--ink);
    border-radius: 18px;
    box-shadow: 5px 5px 0 var(--ink);
    color: var(--text);
  }
  body[data-skin="cartoon"] #root .options-section .player-info { background: transparent; border: none; box-shadow: none; }

  /* Titres de section façon sticker */
  body[data-skin="cartoon"] #root .history-page h2,
  body[data-skin="cartoon"] #root .analysis-page h2,
  body[data-skin="cartoon"] #root .training-page h2,
  body[data-skin="cartoon"] #root .options-page h2,
  body[data-skin="cartoon"] #root .history-page > h2 {
    font-size: 2rem;
    color: var(--c-yellow);
    -webkit-text-stroke: 1.5px var(--ink);
    text-shadow: 3px 3px 0 var(--ink);
  }
  body[data-skin="cartoon"] #root .analysis-section > h3,
  body[data-skin="cartoon"] #root .options-section > h3,
  body[data-skin="cartoon"] #root .detailed-stats-section h3,
  body[data-skin="cartoon"] #root .records-inline h3,
  body[data-skin="cartoon"] #root .averages-inline h3,
  body[data-skin="cartoon"] #root .match-list-header h3,
  body[data-skin="cartoon"] #root .shooting-stats h3,
  body[data-skin="cartoon"] #root .goals-section h3,
  body[data-skin="cartoon"] #root .rolling-averages h3,
  body[data-skin="cartoon"] #root .chart-container h3,
  body[data-skin="cartoon"] #root .save-match-section h3,
  body[data-skin="cartoon"] #root .averages-inline h4,
  body[data-skin="cartoon"] #root .records-inline h4,
  body[data-skin="cartoon"] #root .rolling-averages h4,
  body[data-skin="cartoon"] #root .goals-section h4,
  body[data-skin="cartoon"] #root .shooting-stats h4,
  body[data-skin="cartoon"] #root .detailed-stats-section h4 {
    display: inline-block;
    padding: 3px 12px;
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.2rem;
    letter-spacing: 0.06em;
    color: var(--ink);
    background: var(--c-yellow);
    border: 2.5px solid var(--ink);
    border-radius: 8px;
    box-shadow: 3px 3px 0 var(--ink);
    transform: rotate(-1.5deg);
    -webkit-text-stroke: 0;
    text-shadow: none;
  }
  body[data-skin="cartoon"] #root .analysis-section > h3 { border-bottom: 2.5px solid var(--ink); }
  body[data-skin="cartoon"] #root .chart-container h3 { background: var(--c-cyan); }

  /* Tuiles de stats colorées */
  body[data-skin="cartoon"] #root .detailed-stat,
  body[data-skin="cartoon"] #root .advanced-stat,
  body[data-skin="cartoon"] #root .record-card,
  body[data-skin="cartoon"] #root .shooting-stat,
  body[data-skin="cartoon"] #root .training-stat,
  body[data-skin="cartoon"] #root .quarter-stat-card,
  body[data-skin="cartoon"] #root .playing-time-item,
  body[data-skin="cartoon"] #root .summary-item,
  body[data-skin="cartoon"] #root .heatmap-stat {
    background: var(--c-cyan);
    color: var(--ink);
    border: 2.5px solid var(--ink);
    border-radius: 14px;
    box-shadow: 3px 3px 0 var(--ink);
  }
  body[data-skin="cartoon"] #root .detailed-stat.big,
  body[data-skin="cartoon"] #root .training-stat.total,
  body[data-skin="cartoon"] #root .advanced-stat.streak,
  body[data-skin="cartoon"] #root .quarter-stat-card.current { background: var(--c-yellow); }
  body[data-skin="cartoon"] #root .detailed-stat.negative,
  body[data-skin="cartoon"] #root .advanced-stat.negative { background: #ff8a8a; }
  body[data-skin="cartoon"] #root .detailed-stat.efficiency { background: #b9a2ff; }
  body[data-skin="cartoon"] #root .detailed-stat.positive,
  body[data-skin="cartoon"] #root .advanced-stat.positive { background: var(--c-green); }
  body[data-skin="cartoon"] #root .record-card { background: var(--c-yellow); }
  body[data-skin="cartoon"] #root .record-card:nth-child(odd) { transform: rotate(-1.5deg); }
  body[data-skin="cartoon"] #root .record-card:nth-child(even) { transform: rotate(1.5deg); background: var(--c-pink); }
  body[data-skin="cartoon"] #root .shooting-stat:nth-child(2) { background: var(--c-green); }
  body[data-skin="cartoon"] #root .shooting-stat:nth-child(3) { background: var(--c-pink); }
  body[data-skin="cartoon"] #root .summary-item:nth-child(even),
  body[data-skin="cartoon"] #root .playing-time-item:nth-child(even) { background: var(--c-yellow); }

  /* Chiffres et libellés dans les tuiles */
  body[data-skin="cartoon"] #root .ds-value,
  body[data-skin="cartoon"] #root .adv-value,
  body[data-skin="cartoon"] #root .record-value,
  body[data-skin="cartoon"] #root .shooting-value,
  body[data-skin="cartoon"] #root .pt-value,
  body[data-skin="cartoon"] #root .qs-points,
  body[data-skin="cartoon"] #root .heatmap-stat-value,
  body[data-skin="cartoon"] #root .stat-val,
  body[data-skin="cartoon"] #root .training-stat span:first-child,
  body[data-skin="cartoon"] #root .summary-item span:first-child {
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: 0.03em;
  }
  body[data-skin="cartoon"] #root .detailed-stat .ds-value,
  body[data-skin="cartoon"] #root .advanced-stat .adv-value,
  body[data-skin="cartoon"] #root .record-card .record-value,
  body[data-skin="cartoon"] #root .shooting-stat .shooting-value,
  body[data-skin="cartoon"] #root .playing-time-item .pt-value,
  body[data-skin="cartoon"] #root .quarter-stat-card .qs-points,
  body[data-skin="cartoon"] #root .training-stat,
  body[data-skin="cartoon"] #root .summary-item,
  body[data-skin="cartoon"] #root .heatmap-stat .heatmap-stat-value {
    color: var(--ink);
    -webkit-text-stroke: 0;
    text-shadow: none;
  }
  body[data-skin="cartoon"] #root .detailed-stat .ds-value,
  body[data-skin="cartoon"] #root .advanced-stat .adv-value,
  body[data-skin="cartoon"] #root .record-card .record-value { font-size: 2.2rem; line-height: 1; }
  body[data-skin="cartoon"] #root .detailed-stat.big .ds-value { font-size: 3.2rem; }
  body[data-skin="cartoon"] #root .ds-label,
  body[data-skin="cartoon"] #root .adv-label,
  body[data-skin="cartoon"] #root .adv-desc,
  body[data-skin="cartoon"] #root .record-label,
  body[data-skin="cartoon"] #root .record-info,
  body[data-skin="cartoon"] #root .shooting-label,
  body[data-skin="cartoon"] #root .shooting-pct,
  body[data-skin="cartoon"] #root .pt-label,
  body[data-skin="cartoon"] #root .qs-quarter,
  body[data-skin="cartoon"] #root .qs-detail,
  body[data-skin="cartoon"] #root .heatmap-stat-label {
    color: var(--ink);
    opacity: 0.8;
    font-weight: 700;
  }
  body[data-skin="cartoon"] #root .ds-label,
  body[data-skin="cartoon"] #root .adv-label,
  body[data-skin="cartoon"] #root .record-label,
  body[data-skin="cartoon"] #root .shooting-label,
  body[data-skin="cartoon"] #root .qs-quarter {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 0.95rem;
    letter-spacing: 0.06em;
    opacity: 1;
  }

  body[data-skin="cartoon"] #root .training-stat,
  body[data-skin="cartoon"] #root .training-stat * { color: var(--ink); }
  body[data-skin="cartoon"] #root .edit-btn { color: var(--muted); }
  body[data-skin="cartoon"] #root .option-toggle label,
  body[data-skin="cartoon"] #root .training-desc { color: var(--text); }
  body[data-skin="cartoon"] #root .match-header { flex-direction: row; flex-wrap: wrap; align-items: center; gap: 6px 10px; }
  body[data-skin="cartoon"] #root .match-header .match-opponent { flex-basis: 100%; }
  body[data-skin="cartoon"] #root .match-header .delete-btn { margin-left: auto; }

  /* Cartes de match */
  body[data-skin="cartoon"] #root .match-card { padding: 14px; margin-bottom: 14px; }
  body[data-skin="cartoon"] #root .match-card.has-record { box-shadow: 5px 5px 0 var(--ink), 0 0 0 3px var(--c-yellow) inset; }
  body[data-skin="cartoon"] #root .match-opponent { font-family: var(--font-display); font-size: 1.5rem; letter-spacing: 0.03em; color: var(--text); }
  body[data-skin="cartoon"] #root .match-date { color: var(--muted); font-weight: 700; }
  body[data-skin="cartoon"] #root .match-score {
    font-family: var(--font-display);
    font-size: 1.15rem;
    letter-spacing: 0.04em;
    padding: 2px 10px;
    border: 2.5px solid var(--ink);
    border-radius: 8px;
    box-shadow: 2px 2px 0 var(--ink);
    transform: rotate(-2deg);
    display: inline-block;
  }
  body[data-skin="cartoon"] #root .match-score.win { background: var(--c-green); color: var(--ink); }
  body[data-skin="cartoon"] #root .match-score.loss { background: var(--c-red); color: #fff; }
  body[data-skin="cartoon"] #root .record-badge {
    background: var(--c-yellow);
    color: var(--ink);
    border: 2px solid var(--ink);
    box-shadow: 2px 2px 0 var(--ink);
    font-family: var(--font-display);
    letter-spacing: 0.04em;
    transform: rotate(3deg);
  }
  body[data-skin="cartoon"] #root .match-stat .stat-val { font-size: 1.6rem; color: var(--text); }
  body[data-skin="cartoon"] #root .match-stat .stat-name { font-family: var(--font-display); letter-spacing: 0.06em; color: var(--muted); }

  /* Boutons */
  body[data-skin="cartoon"] #root .theme-btn,
  body[data-skin="cartoon"] #root .gist-config-btn,
  body[data-skin="cartoon"] #root .gist-action-btn,
  body[data-skin="cartoon"] #root .options-btn,
  body[data-skin="cartoon"] #root .toggle-btn,
  body[data-skin="cartoon"] #root .training-reset,
  body[data-skin="cartoon"] #root .share-btn-history,
  body[data-skin="cartoon"] #root .replay-btn-history,
  body[data-skin="cartoon"] #root .more-options-toggle,
  body[data-skin="cartoon"] #root .location-btn,
  body[data-skin="cartoon"] #root .save-btn,
  body[data-skin="cartoon"] #root .action-btn,
  body[data-skin="cartoon"] #root .timer-btn,
  body[data-skin="cartoon"] #root .time-adjust-btn,
  body[data-skin="cartoon"] #root .settings-btn,
  body[data-skin="cartoon"] #root .court-toggle,
  body[data-skin="cartoon"] #root .court-header-buttons button,
  body[data-skin="cartoon"] #root .court-footer button,
  body[data-skin="cartoon"] #root .undo-btn {
    font-family: var(--font-display);
    font-weight: 400;
    font-size: 1.05rem;
    letter-spacing: 0.05em;
    color: var(--ink);
    background: #fff;
    border: 2.5px solid var(--ink);
    border-radius: 12px;
    box-shadow: 3px 3px 0 var(--ink);
    transition: transform 0.08s ease, box-shadow 0.08s ease;
    opacity: 1;
  }
  body[data-skin="cartoon"] #root .theme-btn:active,
  body[data-skin="cartoon"] #root .gist-config-btn:active,
  body[data-skin="cartoon"] #root .gist-action-btn:active,
  body[data-skin="cartoon"] #root .options-btn:active,
  body[data-skin="cartoon"] #root .toggle-btn:active,
  body[data-skin="cartoon"] #root .training-reset:active,
  body[data-skin="cartoon"] #root .share-btn-history:active,
  body[data-skin="cartoon"] #root .replay-btn-history:active,
  body[data-skin="cartoon"] #root .more-options-toggle:active,
  body[data-skin="cartoon"] #root .location-btn:active,
  body[data-skin="cartoon"] #root .save-btn:active,
  body[data-skin="cartoon"] #root .action-btn:active,
  body[data-skin="cartoon"] #root .timer-btn:active,
  body[data-skin="cartoon"] #root .time-adjust-btn:active,
  body[data-skin="cartoon"] #root .court-toggle:active {
    transform: translate(3px, 3px);
    box-shadow: 0 0 0 var(--ink);
  }
  body[data-skin="cartoon"] #root .theme-btn.active,
  body[data-skin="cartoon"] #root .toggle-btn.active,
  body[data-skin="cartoon"] #root .location-btn.active,
  body[data-skin="cartoon"] #root .timer-btn.primary { background: var(--c-yellow); }
  body[data-skin="cartoon"] #root .gist-action-btn.sync-btn,
  body[data-skin="cartoon"] #root .save-btn { background: var(--c-green); }
  body[data-skin="cartoon"] #root .options-btn.danger,
  body[data-skin="cartoon"] #root .action-btn.danger,
  body[data-skin="cartoon"] #root .timer-btn.end-match,
  body[data-skin="cartoon"] #root .delete-btn { background: var(--c-red); color: #fff; }
  body[data-skin="cartoon"] #root .gist-config-btn { background: var(--c-cyan); }
  body[data-skin="cartoon"] #root .more-options-toggle { width: 100%; background: var(--c-pink); color: #fff; -webkit-text-stroke: 0; }
  body[data-skin="cartoon"] #root .timer-btn.quarter-nav.disabled { opacity: 0.45; }
  body[data-skin="cartoon"] #root .delete-btn { border: 2px solid var(--ink); box-shadow: 2px 2px 0 var(--ink); }

  /* Champs */
  body[data-skin="cartoon"] #root input:not([type="file"]):not([type="checkbox"]):not([type="range"]),
  body[data-skin="cartoon"] #root textarea,
  body[data-skin="cartoon"] #root select {
    color: var(--text);
    background: var(--surface-2);
    border: 2.5px solid var(--ink);
    border-radius: 12px;
    box-shadow: inset 2px 2px 0 rgba(0, 0, 0, 0.15);
  }
  body[data-skin="cartoon"] #root input::placeholder,
  body[data-skin="cartoon"] #root textarea::placeholder { color: var(--muted); opacity: 0.8; }
  body[data-skin="cartoon"] #root input:focus,
  body[data-skin="cartoon"] #root textarea:focus,
  body[data-skin="cartoon"] #root select:focus { outline: 3px solid var(--c-yellow); outline-offset: 1px; }
  body[data-skin="cartoon"] #root .match-select { box-shadow: 3px 3px 0 var(--ink); }

  /* Barres de progression (objectifs) */
  body[data-skin="cartoon"] #root .goal-bar { height: 14px; border: 2px solid var(--ink); border-radius: 999px; background: var(--surface-2); overflow: hidden; }
  body[data-skin="cartoon"] #root .goal-progress { background: repeating-linear-gradient(-45deg, var(--c-green), var(--c-green) 8px, #2fc472 8px, #2fc472 16px); border-radius: 999px; }

  /* Fenêtres */
  body[data-skin="cartoon"] #root .help-modal,
  body[data-skin="cartoon"] #root .gist-modal,
  body[data-skin="cartoon"] #root .record-modal,
  body[data-skin="cartoon"] #root .confirm-modal,
  body[data-skin="cartoon"] #root .action-panel,
  body[data-skin="cartoon"] #root .shot-modal-content {
    background: var(--surface) !important;
    color: var(--text);
    border: 4px solid var(--ink) !important;
    border-radius: 22px !important;
    box-shadow: 8px 8px 0 var(--ink) !important;
  }
  body[data-skin="cartoon"] #root .help-modal h2,
  body[data-skin="cartoon"] #root .help-modal h3,
  body[data-skin="cartoon"] #root .gist-modal h2,
  body[data-skin="cartoon"] #root .gist-modal h3,
  body[data-skin="cartoon"] #root .record-modal h2,
  body[data-skin="cartoon"] #root .record-modal h3,
  body[data-skin="cartoon"] #root .confirm-modal h3,
  body[data-skin="cartoon"] #root .action-panel-header h3 {
    font-family: var(--font-display);
    font-weight: 400;
    letter-spacing: 0.05em;
    color: var(--c-yellow);
    -webkit-text-stroke: 1px var(--ink);
    text-shadow: 2px 2px 0 var(--ink);
  }
  body[data-skin="cartoon"] #root .record-modal { animation: fire-in-modal 0.5s cubic-bezier(0.34, 1.6, 0.64, 1); }
  @keyframes fire-in-modal {
    0% { transform: scale(0.3) rotate(-12deg); }
    100% { transform: scale(1) rotate(0); }
  }

  /* ============================================================
     THÈMES (body[data-skin]) — Broadcast = base, chaque thème
     redéfinit les tokens + quelques signatures visuelles.
     Cartoon est défini plus haut (règles préfixées data-skin="cartoon").
     ============================================================ */

  /* Sélecteur de thème (Options) */
  #root .skin-grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 10px; }
  #root .skin-card {
    display: flex;
    flex-direction: column;
    align-items: stretch;
    gap: 6px;
    padding: 6px;
    border-radius: 14px;
    border: 2px solid var(--border);
    background: var(--surface-2);
    color: var(--text);
    cursor: pointer;
    min-height: 0;
    min-width: 0;
  }
  #root .skin-card.active { border-color: var(--accent); box-shadow: 0 0 0 2px var(--accent); }
  #root .skin-swatch {
    position: relative;
    height: 56px;
    border-radius: 10px;
    background:
      linear-gradient(135deg, transparent 55%, var(--sk-b) 55% 70%, transparent 70%),
      linear-gradient(135deg, var(--sk-bg) 0 45%, var(--sk-a) 45%);
    display: flex;
    align-items: center;
    justify-content: center;
    box-shadow: inset 0 0 0 1px rgba(0, 0, 0, 0.2);
  }
  #root .skin-emoji { font-size: 1.6rem; filter: drop-shadow(0 2px 3px rgba(0, 0, 0, 0.4)); }
  #root .skin-name { font-size: 0.8rem; font-weight: 700; text-align: center; line-height: 1.15; }
  body[data-skin="cartoon"] #root .skin-card { border: 2.5px solid var(--ink); box-shadow: 3px 3px 0 var(--ink); background: #fff; color: var(--ink); }
  body[data-skin="cartoon"] #root .skin-card.active { background: var(--c-yellow); }
  body[data-skin="cartoon"] #root .skin-name { font-family: var(--font-display); font-weight: 400; font-size: 0.95rem; letter-spacing: 0.04em; }

  /* ---------- Classique : les couleurs d'origine de l'app ---------- */
  body[data-skin="classic"] {
    --bg: #16213e;
    --bg-glow: linear-gradient(135deg, #1a1a2e 0%, #16213e 100%);
    --surface: #222a4d;
    --surface-2: #2c355e;
    --border: rgba(255, 255, 255, 0.1);
    --text: #ffffff;
    --muted: #a8b3cf;
    --accent: #61dafb;
    --accent-soft: rgba(97, 218, 251, 0.15);
    --good: #2ecc71;
    --bad: #e74c3c;
    --nav-bg: rgba(22, 33, 62, 0.95);
    --shadow: 0 4px 14px rgba(0, 0, 0, 0.25);
    --glow: 0 4px 14px rgba(0, 0, 0, 0.25);
    --grad: linear-gradient(135deg, #61dafb, #3d7bd9);
    --grad-good: linear-gradient(135deg, #2ecc71, #27ae60);
    --font-display: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
    font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
  }
  body[data-skin="classic"] #root .app-header h1 { color: #ff6b35; text-transform: none; }
  body[data-skin="classic"] #root .app-season { background: #ff6b35; }
  body[data-skin="classic"] #root h2, body[data-skin="classic"] #root h3 { text-transform: none; }
  body[data-skin="classic"] #root .stats-category-title { color: #61dafb; }
  body[data-skin="classic"] #root .sb-score-value, body[data-skin="classic"] #root .sb-pts-value, body[data-skin="classic"] #root .qs-value { font-weight: 800; }

  /* ---------- Minimal (façon app fitness) ---------- */
  body[data-skin="minimal"] {
    --bg: #000000;
    --bg-glow: none;
    --surface: #111113;
    --surface-2: #1c1c1f;
    --border: transparent;
    --text: #ffffff;
    --muted: #8e8e93;
    --accent: #30d158;
    --accent-soft: rgba(48, 209, 88, 0.16);
    --good: #30d158;
    --bad: #ff453a;
    --nav-bg: rgba(0, 0, 0, 0.92);
    --shadow: none;
    --glow: none;
    --grad: linear-gradient(90deg, #fa114f, #ff6b2c);
    --grad-good: linear-gradient(135deg, #30d158, #30d158);
    --font-display: -apple-system, 'SF Pro Display', system-ui, 'Segoe UI', Roboto, sans-serif;
  }
  body[data-skin="minimal"] #root .quick-stat,
  body[data-skin="minimal"] #root .shot-col,
  body[data-skin="minimal"] #root .match-header-compact,
  body[data-skin="minimal"] #root .court-container,
  body[data-skin="minimal"] #root .points-total-display { border-radius: 24px; }
  body[data-skin="minimal"] #root .scoreboard::before { height: 0; }
  body[data-skin="minimal"] #root h1, body[data-skin="minimal"] #root h2, body[data-skin="minimal"] #root h3,
  body[data-skin="minimal"] #root .stats-category-title, body[data-skin="minimal"] #root .nav-label,
  body[data-skin="minimal"] #root .qs-label { text-transform: none; letter-spacing: 0; }
  body[data-skin="minimal"] #root .stats-category-title { font-size: 1.15rem; color: var(--text); }
  body[data-skin="minimal"] #root .stats-category-title::before { display: none; }
  body[data-skin="minimal"] #root .sp-btn.missed { border-color: #3a3a3c; color: var(--bad); }
  body[data-skin="minimal"] #root .sb-team.us .sb-score-value { background: none; color: #fa114f; }
  body[data-skin="minimal"] #root .sb-score-value, body[data-skin="minimal"] #root .qs-value, body[data-skin="minimal"] #root .sb-pts-value { font-weight: 700; }

  /* ---------- Néon ---------- */
  body[data-skin="neon"] {
    --bg: #05010f;
    --bg-glow: radial-gradient(700px 400px at 0% 0%, rgba(255, 0, 229, 0.18), transparent 70%), radial-gradient(700px 400px at 100% 10%, rgba(0, 240, 255, 0.16), transparent 70%);
    --surface: #0c0820;
    --surface-2: #17113a;
    --border: rgba(0, 240, 255, 0.35);
    --text: #e6fbff;
    --muted: #7f8db3;
    --accent: #00f0ff;
    --accent-soft: rgba(0, 240, 255, 0.12);
    --good: #39ff14;
    --bad: #ff2a6d;
    --nav-bg: rgba(5, 1, 15, 0.92);
    --shadow: 0 0 0 1px rgba(0, 240, 255, 0.25), 0 0 18px rgba(0, 240, 255, 0.12);
    --glow: 0 0 24px rgba(255, 0, 229, 0.35);
    --grad: linear-gradient(90deg, #00f0ff, #ff00e5);
    --grad-good: linear-gradient(135deg, #39ff14, #00c853);
    --font-display: 'Orbitron', 'Barlow Condensed', sans-serif;
  }
  body[data-skin="neon"] #root .qs-value,
  body[data-skin="neon"] #root .sb-score-value,
  body[data-skin="neon"] #root .sb-pts-value,
  body[data-skin="neon"] #root .app-header h1,
  body[data-skin="neon"] #root .sb-time.running { text-shadow: 0 0 8px currentColor, 0 0 18px currentColor; }
  body[data-skin="neon"] #root .sb-team.us .sb-score-value { background: none; color: #ff00e5; }
  body[data-skin="neon"] #root .sb-team.them .sb-score-value { color: #00f0ff; }
  body[data-skin="neon"] #root .sp-btn.made { background: transparent; border: 2px solid #39ff14; color: #39ff14; box-shadow: 0 0 14px rgba(57, 255, 20, 0.45), inset 0 0 12px rgba(57, 255, 20, 0.25); }
  body[data-skin="neon"] #root .sp-btn.missed { border-color: #ff2a6d; box-shadow: 0 0 14px rgba(255, 42, 109, 0.4), inset 0 0 12px rgba(255, 42, 109, 0.2); }
  body[data-skin="neon"] #root .sb-score-value { font-size: 2.6rem; }
  body[data-skin="neon"] #root .qs-value { font-size: 1.4rem; }
  body[data-skin="neon"] #root .qs-label, body[data-skin="neon"] #root .nav-label { font-size: 0.6rem; }
  body[data-skin="neon"] #root .shot-name, body[data-skin="neon"] #root .shot-line { font-size: 0.85rem; }

  /* ---------- Rétro 80s ---------- */
  body[data-skin="synthwave"] {
    --bg: #1a0b2e;
    --surface: #241040;
    --surface-2: #34175a;
    --border: rgba(255, 41, 117, 0.3);
    --text: #ffffff;
    --muted: #c8a6e8;
    --accent: #ff2975;
    --accent-soft: rgba(255, 41, 117, 0.16);
    --good: #2de2e6;
    --bad: #ff2975;
    --nav-bg: rgba(26, 11, 46, 0.94);
    --shadow: 0 8px 24px rgba(140, 30, 255, 0.25);
    --glow: 0 0 30px rgba(255, 41, 117, 0.35);
    --grad: linear-gradient(135deg, #ffd319, #ff2975 50%, #8c1eff);
    --grad-good: linear-gradient(135deg, #2de2e6, #1fa2ff);
    background:
      repeating-linear-gradient(0deg, rgba(255, 41, 200, 0.08) 0 1px, transparent 1px 34px),
      repeating-linear-gradient(90deg, rgba(255, 41, 200, 0.08) 0 1px, transparent 1px 34px),
      radial-gradient(500px 300px at 50% 0%, rgba(255, 211, 25, 0.25), transparent 70%),
      linear-gradient(180deg, #120024 0%, #2b0b47 55%, #5b1360 100%);
    background-attachment: fixed;
  }
  body[data-skin="synthwave"] #root .app-header h1,
  body[data-skin="synthwave"] #root .sb-score-value,
  body[data-skin="synthwave"] #root .sb-pts-value,
  body[data-skin="synthwave"] #root .qs-value { font-style: italic; }
  body[data-skin="synthwave"] #root .app-header h1 { background: var(--grad); -webkit-background-clip: text; background-clip: text; color: transparent; }
  body[data-skin="synthwave"] #root .sb-team.them .sb-score-value { color: #2de2e6; text-shadow: 0 0 14px rgba(45, 226, 230, 0.6); }

  /* ---------- Arcade 8-bit ---------- */
  body[data-skin="arcade"] {
    --bg: #0f0f23;
    --bg-glow: none;
    --surface: #1d1d3b;
    --surface-2: #2b2b55;
    --border: #ffffff;
    --text: #ffffff;
    --muted: #a0a0d0;
    --accent: #ffcc00;
    --accent-soft: rgba(255, 204, 0, 0.18);
    --good: #00b800;
    --bad: #e40058;
    --nav-bg: #0f0f23;
    --shadow: 4px 4px 0 #000;
    --glow: 4px 4px 0 #000;
    --grad: linear-gradient(#ffcc00, #ffcc00);
    --grad-good: linear-gradient(#00b800, #00b800);
    --font-display: 'Press Start 2P', monospace;
    background: repeating-linear-gradient(0deg, rgba(255, 255, 255, 0.03) 0 2px, transparent 2px 4px), #0f0f23;
  }
  body[data-skin="arcade"] #root .quick-stat,
  body[data-skin="arcade"] #root .shot-col,
  body[data-skin="arcade"] #root .match-header-compact,
  body[data-skin="arcade"] #root .court-container,
  body[data-skin="arcade"] #root .points-total-display,
  body[data-skin="arcade"] #root .sp-btn,
  body[data-skin="arcade"] #root .qs-minus,
  body[data-skin="arcade"] #root .sb-score-btns button,
  body[data-skin="arcade"] #root .nav-icon,
  body[data-skin="arcade"] #root .app-season,
  body[data-skin="arcade"] #root .sb-play { border-radius: 0; }
  body[data-skin="arcade"] #root .quick-stat,
  body[data-skin="arcade"] #root .shot-col,
  body[data-skin="arcade"] #root .match-header-compact { border: 3px solid #fff; }
  body[data-skin="arcade"] #root .sp-btn { border: 3px solid #000; box-shadow: 4px 4px 0 #000; }
  body[data-skin="arcade"] #root .sp-btn:active { transform: translate(4px, 4px); box-shadow: none; }
  body[data-skin="arcade"] #root .app-header h1 { font-size: 0.95rem; color: var(--accent); line-height: 1.6; }
  body[data-skin="arcade"] #root .app-season { font-size: 0.55rem; padding: 4px 6px; color: #000; }
  body[data-skin="arcade"] #root .sb-time { font-size: 1rem; }
  body[data-skin="arcade"] #root .sb-quarter { font-size: 0.7rem; }
  body[data-skin="arcade"] #root .sb-score-value { font-size: 2rem; line-height: 1.2; }
  body[data-skin="arcade"] #root .sb-team.us .sb-score-value { background: none; color: var(--accent); }
  body[data-skin="arcade"] #root .sb-team-label, body[data-skin="arcade"] #root .sb-live, body[data-skin="arcade"] #root .sb-paused,
  body[data-skin="arcade"] #root .sb-court, body[data-skin="arcade"] #root .sb-diff { font-size: 0.55rem; }
  body[data-skin="arcade"] #root .sb-player-name { font-size: 0.7rem; }
  body[data-skin="arcade"] #root .sb-player-number, body[data-skin="arcade"] #root .sb-pts-label { font-size: 0.5rem; }
  body[data-skin="arcade"] #root .sb-pts-value { font-size: 1.3rem; }
  body[data-skin="arcade"] #root .sb-mini { font-size: 0.45rem; gap: 6px; }
  body[data-skin="arcade"] #root .sb-mini b { font-size: 0.75rem; }
  body[data-skin="arcade"] #root .shot-name, body[data-skin="arcade"] #root .shot-line { font-size: 0.6rem; }
  body[data-skin="arcade"] #root .shot-pct { font-size: 0.5rem; margin-top: 0; }
  body[data-skin="arcade"] #root .qs-label { font-size: 0.45rem; line-height: 1.4; }
  body[data-skin="arcade"] #root .qs-value { font-size: 1.1rem; }
  body[data-skin="arcade"] #root .stats-category-title { font-size: 0.6rem; }
  body[data-skin="arcade"] #root .nav-label { font-size: 0.42rem; }
  body[data-skin="arcade"] #root h2, body[data-skin="arcade"] #root h3 { font-size: 0.8rem; line-height: 1.6; }
  body[data-skin="arcade"] .pop, body[data-skin="arcade"] .fire-banner { font-size: 1rem; }
  body[data-skin="arcade"] #root .sb-live-dot { border-radius: 0; }

  /* ---------- Playground (street) ---------- */
  body[data-skin="street"] {
    --bg: #2b2b2b;
    --surface: #363636;
    --surface-2: #444444;
    --border: rgba(255, 255, 255, 0.35);
    --text: #f5f5f5;
    --muted: #b5b5b5;
    --accent: #ffe600;
    --accent-soft: rgba(255, 230, 0, 0.16);
    --good: #7cff4f;
    --bad: #ff4d4d;
    --nav-bg: rgba(30, 30, 30, 0.95);
    --shadow: 0 6px 16px rgba(0, 0, 0, 0.45);
    --glow: 0 6px 16px rgba(0, 0, 0, 0.45);
    --grad: linear-gradient(135deg, #ffe600, #ff8a00);
    --grad-good: linear-gradient(135deg, #7cff4f, #3ccf1a);
    --font-display: 'Permanent Marker', 'Barlow Condensed', cursive;
    background:
      radial-gradient(rgba(255, 255, 255, 0.05) 1px, transparent 1.2px) 0 0 / 7px 7px,
      radial-gradient(rgba(0, 0, 0, 0.25) 1px, transparent 1.2px) 3px 4px / 9px 9px,
      #2b2b2b;
    background-attachment: fixed;
  }
  body[data-skin="street"] #root .quick-stat,
  body[data-skin="street"] #root .shot-col,
  body[data-skin="street"] #root .match-header-compact,
  body[data-skin="street"] #root .court-container { border: 2px dashed rgba(255, 255, 255, 0.4); }
  body[data-skin="street"] #root .app-header h1 { color: var(--accent); transform: rotate(-3deg); text-shadow: 3px 3px 0 #000; }
  body[data-skin="street"] #root .stats-category-title { color: var(--accent); font-size: 1.1rem; transform: rotate(-2deg); }
  body[data-skin="street"] #root .stats-category-title::before { display: none; }
  body[data-skin="street"] #root .qs-label, body[data-skin="street"] #root .nav-label { letter-spacing: 0.02em; }
  body[data-skin="street"] #root .sb-team.us .sb-score-value { background: none; color: var(--accent); text-shadow: 3px 3px 0 #000; }
  body[data-skin="street"] #root .quick-stat:nth-child(odd) { transform: rotate(-1deg); }
  body[data-skin="street"] #root .quick-stat:nth-child(even) { transform: rotate(1deg); }

  /* ---------- Tableau du coach (craie) ---------- */
  body[data-skin="chalk"] {
    --bg: #22392b;
    --surface: #284433;
    --surface-2: #31523e;
    --border: rgba(243, 241, 232, 0.55);
    --text: #f3f1e8;
    --muted: #c9d2c4;
    --accent: #ffe08a;
    --accent-soft: rgba(255, 224, 138, 0.15);
    --good: #b9f6a7;
    --bad: #ff9e9e;
    --nav-bg: rgba(30, 50, 38, 0.96);
    --shadow: none;
    --glow: none;
    --grad: linear-gradient(#ffe08a, #ffe08a);
    --grad-good: linear-gradient(rgba(185, 246, 167, 0.18), rgba(185, 246, 167, 0.18));
    --font-display: 'Caveat', 'Comic Sans MS', cursive;
    background:
      radial-gradient(600px 300px at 20% 10%, rgba(255, 255, 255, 0.06), transparent 70%),
      radial-gradient(500px 400px at 80% 70%, rgba(255, 255, 255, 0.04), transparent 70%),
      #22392b;
    background-attachment: fixed;
  }
  body[data-skin="chalk"] #root .quick-stat,
  body[data-skin="chalk"] #root .shot-col,
  body[data-skin="chalk"] #root .match-header-compact,
  body[data-skin="chalk"] #root .court-container,
  body[data-skin="chalk"] #root .points-total-display {
    border: 2px solid var(--border);
    border-radius: 255px 15px 225px 15px / 15px 225px 15px 255px;
  }
  body[data-skin="chalk"] #root .scoreboard::before { height: 0; }
  body[data-skin="chalk"] #root .sp-btn.made { color: var(--good); border: 2px solid var(--good); }
  body[data-skin="chalk"] #root .sp-btn { border-radius: 40px 10px 40px 10px / 10px 40px 10px 40px; }
  body[data-skin="chalk"] #root .qs-value, body[data-skin="chalk"] #root .sb-score-value, body[data-skin="chalk"] #root .sb-pts-value { font-size: 2.2rem; }
  body[data-skin="chalk"] #root .sb-score-value { font-size: 3.6rem; }
  body[data-skin="chalk"] #root .qs-label, body[data-skin="chalk"] #root .nav-label, body[data-skin="chalk"] #root .stats-category-title { text-transform: none; font-size: 1.05rem; letter-spacing: 0; }
  body[data-skin="chalk"] #root .sb-team.us .sb-score-value { background: none; color: var(--accent); }
  body[data-skin="chalk"] #root .app-header h1 { text-transform: none; font-size: 2rem; }

  /* ---------- Parquet (clair) ---------- */
  body[data-skin="parquet"] {
    --bg: #e3bd85;
    --surface: #fffaf0;
    --surface-2: #f5e9d3;
    --border: rgba(58, 36, 20, 0.15);
    --text: #3a2414;
    --muted: #8a6a4f;
    --accent: #d35400;
    --accent-soft: rgba(211, 84, 0, 0.12);
    --good: #27ae60;
    --bad: #c0392b;
    --nav-bg: rgba(255, 250, 240, 0.95);
    --shadow: 0 4px 12px rgba(58, 36, 20, 0.18);
    --glow: 0 6px 18px rgba(58, 36, 20, 0.2);
    --grad: linear-gradient(135deg, #e67e22, #d35400);
    --grad-good: linear-gradient(135deg, #2ecc71, #27ae60);
    background:
      repeating-linear-gradient(90deg, rgba(0, 0, 0, 0.06) 0 1px, transparent 1px 70px),
      repeating-linear-gradient(90deg, #e8c58f 0 70px, #deb67c 70px 140px, #e3bd85 140px 210px, #d9b077 210px 280px);
    background-attachment: fixed;
  }
  body[data-skin="parquet"] #root .app-header h1 { color: #3a2414; }

  /* ---------- Journal sportif (clair) ---------- */
  body[data-skin="journal"] {
    --bg: #f4f1ea;
    --surface: #fffdf8;
    --surface-2: #ece6da;
    --border: #111111;
    --text: #111111;
    --muted: #555555;
    --accent: #c8102e;
    --accent-soft: rgba(200, 16, 46, 0.1);
    --good: #1b7f3b;
    --bad: #c8102e;
    --nav-bg: #fffdf8;
    --shadow: none;
    --glow: none;
    --grad: linear-gradient(#111, #111);
    --grad-good: linear-gradient(#1b7f3b, #1b7f3b);
    --font-display: 'Playfair Display', Georgia, 'Times New Roman', serif;
    background: radial-gradient(rgba(0, 0, 0, 0.06) 0.8px, transparent 1px) 0 0 / 5px 5px, #f4f1ea;
  }
  body[data-skin="journal"] #root .quick-stat,
  body[data-skin="journal"] #root .shot-col,
  body[data-skin="journal"] #root .match-header-compact,
  body[data-skin="journal"] #root .court-container,
  body[data-skin="journal"] #root .points-total-display,
  body[data-skin="journal"] #root .sp-btn { border-radius: 2px; border: 1.5px solid #111; }
  body[data-skin="journal"] #root .scoreboard::before { height: 6px; background: #c8102e; }
  body[data-skin="journal"] #root .app-header h1 { font-weight: 900; text-transform: none; font-style: italic; letter-spacing: -0.02em; border-bottom: 3px double #111; }
  body[data-skin="journal"] #root .app-season { background: #c8102e; border-radius: 0; font-family: Georgia, serif; }
  body[data-skin="journal"] #root .sb-score-value, body[data-skin="journal"] #root .qs-value, body[data-skin="journal"] #root .sb-pts-value { font-weight: 900; }
  body[data-skin="journal"] #root .stats-category-title { color: #c8102e; border-bottom: 1px solid #111; }
  body[data-skin="journal"] #root .stats-category-title::before { display: none; }
  body[data-skin="journal"] #root .sp-btn.missed { background: #fff; }

  /* ---------- Violet & Or ---------- */
  body[data-skin="purplegold"] {
    --bg: #1d0b33;
    --bg-glow: radial-gradient(900px 500px at 50% -200px, rgba(253, 185, 39, 0.16), transparent 70%);
    --surface: #2a1248;
    --surface-2: #3a1c60;
    --border: rgba(253, 185, 39, 0.22);
    --text: #ffffff;
    --muted: #c7b6e0;
    --accent: #fdb927;
    --accent-soft: rgba(253, 185, 39, 0.16);
    --good: #4ade80;
    --bad: #f87171;
    --nav-bg: rgba(29, 11, 51, 0.95);
    --grad: linear-gradient(135deg, #ffd56b, #fdb927 50%, #e09b00);
    --glow: 0 10px 30px rgba(253, 185, 39, 0.18);
  }

  /* ---------- Vert & Blanc (clair) ---------- */
  body[data-skin="greenwhite"] {
    --bg: #f2f7f3;
    --bg-glow: radial-gradient(900px 500px at 50% -200px, rgba(0, 122, 51, 0.12), transparent 70%);
    --surface: #ffffff;
    --surface-2: #e3efe6;
    --border: rgba(0, 122, 51, 0.18);
    --text: #0b2e1a;
    --muted: #4b6b57;
    --accent: #007a33;
    --accent-soft: rgba(0, 122, 51, 0.12);
    --good: #007a33;
    --bad: #c0392b;
    --nav-bg: rgba(255, 255, 255, 0.95);
    --shadow: 0 2px 10px rgba(11, 46, 26, 0.08);
    --glow: 0 6px 18px rgba(0, 122, 51, 0.15);
    --grad: linear-gradient(135deg, #00a14b, #007a33);
    --grad-good: linear-gradient(135deg, #00a14b, #007a33);
  }

  /* ---------- Rouge & Noir ---------- */
  body[data-skin="redblack"] {
    --bg: #0a0a0a;
    --bg-glow: radial-gradient(900px 500px at 50% -200px, rgba(206, 17, 65, 0.22), transparent 70%);
    --surface: #161616;
    --surface-2: #222222;
    --border: rgba(255, 255, 255, 0.08);
    --text: #ffffff;
    --muted: #a3a3a3;
    --accent: #ce1141;
    --accent-soft: rgba(206, 17, 65, 0.16);
    --good: #22c55e;
    --bad: #ff2a4d;
    --nav-bg: rgba(10, 10, 10, 0.95);
    --grad: linear-gradient(135deg, #ff2a4d, #ce1141);
    --glow: 0 10px 30px rgba(206, 17, 65, 0.25);
  }

  /* ---------- Océan ---------- */
  body[data-skin="ocean"] {
    --bg: #021a2b;
    --bg-glow: radial-gradient(900px 500px at 20% -150px, rgba(45, 212, 191, 0.18), transparent 70%), radial-gradient(800px 500px at 100% 0, rgba(56, 189, 248, 0.16), transparent 70%);
    --surface: #0a2a40;
    --surface-2: #103a55;
    --border: rgba(56, 189, 248, 0.18);
    --text: #e6f6ff;
    --muted: #8fb3c9;
    --accent: #2dd4bf;
    --accent-soft: rgba(45, 212, 191, 0.14);
    --good: #34d399;
    --bad: #fb7185;
    --nav-bg: rgba(2, 26, 43, 0.94);
    --grad: linear-gradient(135deg, #38bdf8, #2dd4bf);
    --grad-good: linear-gradient(135deg, #34d399, #10b981);
    --glow: 0 10px 30px rgba(45, 212, 191, 0.18);
  }
`

// Thèmes disponibles : mode = sombre/clair (pilote aussi les anciennes règles [data-theme="light"])
const SKINS = [
  { id: 'classic', name: 'Classique', emoji: '🏀', mode: 'dark', colors: ['#16213e', '#61dafb', '#ff6b35'] },
  { id: 'broadcast', name: 'Broadcast', emoji: '📺', mode: 'dark', colors: ['#0b1018', '#ff8a1f', '#8b5cf6'] },
  { id: 'light', name: 'Clair', emoji: '☀️', mode: 'light', colors: ['#f3f5f9', '#ea580c', '#111827'] },
  { id: 'cartoon', name: 'Cartoon', emoji: '💥', mode: 'dark', colors: ['#23175a', '#ffd23f', '#ff4fa3'] },
  { id: 'minimal', name: 'Minimal', emoji: '⚪', mode: 'dark', colors: ['#000000', '#30d158', '#fa114f'] },
  { id: 'neon', name: 'Néon', emoji: '⚡', mode: 'dark', colors: ['#05010f', '#00f0ff', '#ff00e5'] },
  { id: 'synthwave', name: 'Rétro 80s', emoji: '🌆', mode: 'dark', colors: ['#2b0b47', '#ff2975', '#ffd319'] },
  { id: 'arcade', name: 'Arcade 8-bit', emoji: '👾', mode: 'dark', colors: ['#0f0f23', '#ffcc00', '#e40058'] },
  { id: 'street', name: 'Playground', emoji: '🛹', mode: 'dark', colors: ['#2b2b2b', '#ffe600', '#ff8a00'] },
  { id: 'chalk', name: 'Tableau du coach', emoji: '📋', mode: 'dark', colors: ['#22392b', '#ffe08a', '#f3f1e8'] },
  { id: 'parquet', name: 'Parquet', emoji: '🪵', mode: 'light', colors: ['#e3bd85', '#d35400', '#3a2414'] },
  { id: 'journal', name: 'Journal sportif', emoji: '📰', mode: 'light', colors: ['#f4f1ea', '#c8102e', '#111111'] },
  { id: 'purplegold', name: 'Violet & Or', emoji: '👑', mode: 'dark', colors: ['#1d0b33', '#fdb927', '#7c3aed'] },
  { id: 'greenwhite', name: 'Vert & Blanc', emoji: '☘️', mode: 'light', colors: ['#f2f7f3', '#007a33', '#0b2e1a'] },
  { id: 'redblack', name: 'Rouge & Noir', emoji: '🐂', mode: 'dark', colors: ['#0a0a0a', '#ce1141', '#ffffff'] },
  { id: 'ocean', name: 'Océan', emoji: '🌊', mode: 'dark', colors: ['#021a2b', '#2dd4bf', '#38bdf8'] }
]

// Petite vibration au tap (ignorée si non supportée)
const tapFeedback = () => { if (navigator.vibrate) navigator.vibrate(12) }

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
  const [skin, setSkin] = useState(() => localStorage.getItem('basketSkin') || 'classic')
  const skinDef = SKINS.find(sk => sk.id === skin) || SKINS[0]
  const [githubToken, setGithubToken] = useState(() => {
    const saved = localStorage.getItem('basketGithubToken')
    return saved ? atob(saved) : ''
  })
  const [gistId, setGistId] = useState(() => localStorage.getItem('basketGistId') || '')
  const [goals, setGoals] = useState(() => {
    const saved = localStorage.getItem('basketGoals')
    return saved ? JSON.parse(saved) : { points: '', rebounds: '', assists: '' }
  })
  const [showTraining, setShowTraining] = useState(() => {
    const saved = localStorage.getItem('basketShowTraining')
    return saved ? JSON.parse(saved) : true
  })
  const [showGistSettings, setShowGistSettings] = useState(false)
  const [gistLoading, setGistLoading] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [showActionPanel, setShowActionPanel] = useState(false)
  const [trainingMarkers, setTrainingMarkers] = useState([])
  const [trainingStats, setTrainingStats] = useState({ fg2Made: 0, fg2Attempted: 0, fg3Made: 0, fg3Attempted: 0, ftMade: 0, ftAttempted: 0 })
  const [asSessions, setAsSessions] = useState(() => {
    const saved = localStorage.getItem('basketAsSessions')
    return saved ? JSON.parse(saved) : []
  })
  const [asPoints, setAsPoints] = useState(() => Number(localStorage.getItem('basketAsCurrent')) || 0)
  const [actionToDelete, setActionToDelete] = useState(null) // Action pending deletion confirmation
  const [showMoreOptions, setShowMoreOptions] = useState(false)
  const [lastActionTime, setLastActionTime] = useState(Date.now())
  const [inactivityWarning, setInactivityWarning] = useState(false)
  const [showReplay, setShowReplay] = useState(false)
  const [recordNotification, setRecordNotification] = useState(null) // { records: [...] }
  const [showHelpModal, setShowHelpModal] = useState(false)
  const [analysisSelectedMatchId, setAnalysisSelectedMatchId] = useState('all')



  const { stats, updateStat, resetStats, importStats, getSummary, getEfficiency, getStreaks, actionHistory, getStatsByQuarter, undoLastAction, deleteAction } = useStats()
  const { player, updatePlayer } = usePlayer()
  const timer = useTimer()
  const { history, seasonHistory, season, setSeason, seasons, currentSeason, saveMatch, deleteMatch, updateMatchOpponent, updateMatchScore, updateMatchPhoto, clearHistory, importHistory, getAverages, getRecentAverages, getRecords, checkNewRecords } = useMatchHistory()
  const playingTime = usePlayingTime()

  const summary = getSummary()
  const averages = getAverages()
  const quarterStats = getStatsByQuarter()
  const efficiency = getEfficiency()
  const streaks = getStreaks()

  // Effets "cartoon" : bulles BD, confettis, tremblement, bandeau "EN FEU"
  const [pops, setPops] = useState([])
  const [bits, setBits] = useState([])
  const [shake, setShake] = useState(false)
  const [fire, setFire] = useState(0)
  const pop = (e, text, tone = 'good', small = false) => {
    const id = Date.now() + Math.random()
    const x = e?.clientX || window.innerWidth / 2
    const y = e?.clientY || window.innerHeight / 2
    const rot = Math.round(Math.random() * 24 - 12)
    setPops(prev => [...prev, { id, text, tone, small, x, y, rot }])
    setTimeout(() => setPops(prev => prev.filter(p => p.id !== id)), 900)
  }
  const confetti = (e) => {
    const x = e?.clientX || window.innerWidth / 2
    const y = e?.clientY || window.innerHeight / 2
    const colors = ['#ffd23f', '#ff4fa3', '#2ee6d6', '#ff7b1c', '#3ddc84', '#8b5cf6']
    const batch = Array.from({ length: 18 }, (_, i) => {
      const angle = (i / 18) * Math.PI * 2 + Math.random() * 0.4
      const dist = 70 + Math.random() * 70
      return {
        id: Date.now() + Math.random(), x, y,
        dx: Math.round(Math.cos(angle) * dist), dy: Math.round(Math.sin(angle) * dist - 40),
        rot: Math.round(Math.random() * 720 - 360), color: colors[i % colors.length]
      }
    })
    setBits(prev => [...prev, ...batch])
    setTimeout(() => setBits(prev => prev.filter(b => !batch.includes(b))), 1000)
  }
  const FX = {
    made2: { words: ['SWISH !', 'PANIER !', 'BANG !', 'DEDANS !'], tone: 'good' },
    made3: { words: ['SPLASH !', 'BOUM !', 'DE LOIN !', 'BANG BANG !'], tone: 'gold', confetti: true },
    madeFT: { words: ['NET !', 'PROPRE !'], tone: 'good' },
    miss: { words: ['CLANG !', 'BRIQUE !', 'RATÉ !', 'AÏE !'], tone: 'bad', shake: true },
    offRebounds: { words: ['REBOND !'], tone: 'cyan' },
    defRebounds: { words: ['REBOND !'], tone: 'cyan' },
    assists: { words: ['CAVIAR !', 'PASSE !'], tone: 'gold' },
    steals: { words: ['VOLÉ !', 'INTER !'], tone: 'good' },
    blocks: { words: ['CONTRÉ !', 'DEHORS !'], tone: 'pink' },
    turnovers: { words: ['OUPS !'], tone: 'bad' },
    fouls: { words: ['FAUTE !'], tone: 'bad' },
    us: { words: ['+1'], tone: 'good', small: true },
    them: { words: ['+1'], tone: 'bad', small: true }
  }
  const fx = (e, kind) => {
    const f = FX[kind]
    pop(e, f.words[Math.floor(Math.random() * f.words.length)], f.tone, f.small)
    if (f.confetti) confetti(e)
    if (f.shake) {
      setShake(true)
      setTimeout(() => setShake(false), 450)
    }
  }
  // Bandeau "EN FEU" à partir de 3 tirs réussis d'affilée
  const prevStreak = useRef(streaks.currentStreak)
  useEffect(() => {
    if (streaks.currentStreak >= 3 && streaks.currentStreak > prevStreak.current) {
      setFire(streaks.currentStreak)
      const t = setTimeout(() => setFire(0), 1600)
      prevStreak.current = streaks.currentStreak
      return () => clearTimeout(t)
    }
    prevStreak.current = streaks.currentStreak
  }, [streaks.currentStreak])

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
    localStorage.setItem('basketSkin', skinDef.id)
    document.body.setAttribute('data-skin', skinDef.id)
    document.body.setAttribute('data-theme', skinDef.mode)
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', skinDef.colors[0])
  }, [skinDef])

  useEffect(() => {
    localStorage.setItem('basketGoals', JSON.stringify(goals))
  }, [goals])

  useEffect(() => {
    localStorage.setItem('basketShowTraining', JSON.stringify(showTraining))
  }, [showTraining])

  useEffect(() => {
    localStorage.setItem('basketAsSessions', JSON.stringify(asSessions))
  }, [asSessions])

  useEffect(() => {
    localStorage.setItem('basketAsCurrent', String(asPoints))
  }, [asPoints])


  // Inactivity warning: if timer running + on court + no action for 2 min
  useEffect(() => {
    if (!timer.isRunning || !playingTime.isOnCourt) {
      setInactivityWarning(false)
      return
    }
    const check = setInterval(() => {
      if (Date.now() - lastActionTime > 120000) {
        setInactivityWarning(true)
      }
    }, 10000)
    return () => clearInterval(check)
  }, [timer.isRunning, playingTime.isOnCourt, lastActionTime])

  // Voice commands
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
    setLastActionTime(Date.now())
    setInactivityWarning(false)
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
      if (confirm('Synchroniser avec le Gist ?')) {
        pushToGist(updatedHistory).then(() => {
          alert('✅ Gist mis à jour !')
        }).catch(err => {
          alert(`Erreur sync: ${err.message}`)
        })
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

  // Fetch Gist data without modifying anything
  const fetchGistData = async () => {
    const targetGistId = gistId || prompt('Entre l\'ID du Gist :')
    if (!targetGistId) return null

    const response = await fetch(`https://api.github.com/gists/${targetGistId}`, {
      headers: { 'Authorization': `token ${githubToken}` }
    })

    if (!response.ok) {
      const errData = await response.json().catch(() => null)
      throw new Error(`${response.status}: ${errData?.message || 'Gist non trouvé ou accès refusé.'}`)
    }

    const data = await response.json()
    const fileContent = data.files['stats_basket_backup.json']?.content
    if (!fileContent) throw new Error('Fichier stats_basket_backup.json non trouvé dans le Gist.')

    const backupData = JSON.parse(fileContent)
    if (!backupData.history || !Array.isArray(backupData.history)) {
      throw new Error('Fichier de backup invalide.')
    }

    if (!gistId) {
      setGistId(targetGistId)
      localStorage.setItem('basketGistId', targetGistId)
    }

    return backupData
  }

  // Push local history to Gist
  const pushToGist = async (historyToSave) => {
    const backupData = {
      exportDate: new Date().toISOString(),
      player: player,
      matchCount: historyToSave.length,
      history: historyToSave
    }

    const response = await fetch(`https://api.github.com/gists/${gistId}`, {
      method: 'PATCH',
      headers: {
        'Authorization': `token ${githubToken}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        description: `Stats Basket - Backup ${player.name || 'joueur'} (${historyToSave.length} matchs)`,
        files: {
          'stats_basket_backup.json': {
            content: JSON.stringify(backupData, null, 2)
          }
        }
      })
    })

    if (!response.ok) throw new Error('Échec du push vers le Gist')
    return true
  }

  // Compare two match objects to detect modifications
  const matchDiffers = (local, remote) => {
    // Compare key fields that can be edited after save
    if (local.opponent !== remote.opponent) return true
    if (JSON.stringify(local.score) !== JSON.stringify(remote.score)) return true
    if (local.photo !== remote.photo) return true
    if (JSON.stringify(local.notes) !== JSON.stringify(remote.notes)) return true
    // Compare stats in case of any correction
    if (local.summary.points !== remote.summary.points) return true
    if (local.summary.rebounds !== remote.summary.rebounds) return true
    return false
  }

  // Describe differences for a match
  const describeDiff = (local, remote) => {
    const diffs = []
    if (local.opponent !== remote.opponent) diffs.push(`Adversaire: "${local.opponent || '—'}" vs "${remote.opponent || '—'}"`)
    if (JSON.stringify(local.score) !== JSON.stringify(remote.score)) {
      const ls = local.score ? `${local.score.team}-${local.score.opponent}` : '—'
      const rs = remote.score ? `${remote.score.team}-${remote.score.opponent}` : '—'
      diffs.push(`Score: ${ls} vs ${rs}`)
    }
    if (local.summary.points !== remote.summary.points) diffs.push(`Points: ${local.summary.points} vs ${remote.summary.points}`)
    if (local.photo && !remote.photo) diffs.push('Photo ajoutée localement')
    if (!local.photo && remote.photo) diffs.push('Photo sur le Gist')
    if (JSON.stringify(local.notes) !== JSON.stringify(remote.notes)) diffs.push('Notes différentes')
    return diffs
  }

  // Full bidirectional sync
  const handleSync = async () => {
    if (!githubToken) {
      setShowGistSettings(true)
      return
    }

    setGistLoading(true)
    try {
      const remoteData = await fetchGistData()
      if (!remoteData) return

      const remoteHistory = remoteData.history
      const localMap = new Map(history.map(m => [m.id, m]))
      const remoteMap = new Map(remoteHistory.map(m => [m.id, m]))

      // Categorize differences
      const onlyLocal = history.filter(m => !remoteMap.has(m.id))
      const onlyRemote = remoteHistory.filter(m => !localMap.has(m.id))
      const modified = []

      for (const [id, local] of localMap) {
        const remote = remoteMap.get(id)
        if (remote && matchDiffers(local, remote)) {
          modified.push({ id, local, remote, diffs: describeDiff(local, remote) })
        }
      }

      // Build sync report
      const hasChanges = onlyLocal.length > 0 || onlyRemote.length > 0 || modified.length > 0

      if (!hasChanges) {
        alert(`✅ Tout est synchronisé !\n\nLocal: ${history.length} match(s)\nGist: ${remoteHistory.length} match(s)`)
        return
      }

      let report = `📊 Rapport de synchronisation\n\n`
      report += `Local: ${history.length} match(s) | Gist: ${remoteHistory.length} match(s)\n\n`

      if (onlyLocal.length > 0) {
        report += `➕ ${onlyLocal.length} match(s) uniquement en local:\n`
        onlyLocal.forEach(m => {
          report += `  • ${m.opponent || 'Match'} (${m.summary.points} pts)\n`
        })
        report += '\n'
      }

      if (onlyRemote.length > 0) {
        report += `⬇️ ${onlyRemote.length} match(s) uniquement sur le Gist:\n`
        onlyRemote.forEach(m => {
          report += `  • ${m.opponent || 'Match'} (${m.summary.points} pts)\n`
        })
        report += '\n'
      }

      if (modified.length > 0) {
        report += `⚠️ ${modified.length} match(s) modifié(s) (local vs Gist):\n`
        modified.forEach(({ local, diffs }) => {
          report += `  • ${local.opponent || 'Match'}: ${diffs.join(', ')}\n`
        })
        report += '\n'
      }

      report += `Fusionner ? (local prioritaire pour les conflits)`

      if (confirm(report)) {
        // Merge: start with local, add remote-only, for conflicts keep local
        const merged = [...history]

        // Add remote-only matches
        onlyRemote.forEach(m => merged.push(m))

        // Sort by date
        merged.sort((a, b) => new Date(a.date) - new Date(b.date))

        // Update local
        importHistory(merged)

        // Restore player info if needed
        if (remoteData.player) {
          if (remoteData.player.name && !player.name) updatePlayer('name', remoteData.player.name)
          if (remoteData.player.number && !player.number) updatePlayer('number', remoteData.player.number)
        }

        // Push merged result to Gist
        if (confirm('Envoyer le résultat fusionné vers le Gist ?')) {
          await pushToGist(merged)
          alert(`✅ Sync terminée ! ${merged.length} match(s) synchronisés.`)
        } else {
          alert(`✅ Fusion locale terminée ! ${merged.length} match(s). Gist non mis à jour.`)
        }
      }
    } catch (err) {
      alert(`Erreur sync: ${err.message}`)
    } finally {
      setGistLoading(false)
    }
  }

  // Legacy loadFromGist redirects to handleSync
  const loadFromGist = handleSync

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
        <div className="pop-layer" aria-hidden="true">
          {pops.map(p => (
            <span key={p.id} className={`pop ${p.tone} ${p.small ? 'small' : ''}`} style={{ left: p.x, top: p.y, '--rot': `${p.rot}deg` }}>{p.text}</span>
          ))}
          {bits.map(b => (
            <span key={b.id} className="confetti" style={{ left: b.x, top: b.y, background: b.color, '--dx': `${b.dx}px`, '--dy': `${b.dy}px`, '--r': `${b.rot}deg` }} />
          ))}
          {fire > 0 && <div key={fire} className="fire-banner">EN FEU ! 🔥×{fire}</div>}
        </div>
        <header className="app-header">
          <h1>🏀 Stats Basket <span className="app-season">{currentSeason}</span></h1>
          <button
            className="help-btn"
            onClick={() => setShowHelpModal(true)}
            title="Aide & Légende"
          >
            ?
          </button>
        </header>

        {/* Navigation */}
        <nav className="nav-tabs">
          <button
            className={`nav-tab ${activeTab === 'match' ? 'active' : ''}`}
            onClick={() => setActiveTab('match')}
          >
            <span className="nav-icon">🎮</span><span className="nav-label">Match</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <span className="nav-icon">📋</span><span className="nav-label">Histo.</span>
            {seasonHistory.length > 0 && <span className="nav-badge">{seasonHistory.length}</span>}
          </button>
          {showTraining && (
            <button
              className={`nav-tab ${activeTab === 'training' ? 'active' : ''}`}
              onClick={() => setActiveTab('training')}
            >
              <span className="nav-icon">🏋️</span><span className="nav-label">Entraîn.</span>
            </button>
          )}
          <button
            className={`nav-tab ${activeTab === 'as' ? 'active' : ''}`}
            onClick={() => setActiveTab('as')}
          >
            <span className="nav-icon">🏫</span><span className="nav-label">AS</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'analysis' ? 'active' : ''}`}
            onClick={() => setActiveTab('analysis')}
          >
            <span className="nav-icon">📈</span><span className="nav-label">Analyse</span>
          </button>
          <button
            className={`nav-tab ${activeTab === 'options' ? 'active' : ''}`}
            onClick={() => setActiveTab('options')}
          >
            <span className="nav-icon">⚙️</span><span className="nav-label">Options</span>
          </button>
        </nav>

        {activeTab === 'match' ? (
          <>
            {/* Scoreboard façon broadcast (collant en haut) */}
            <div className={`match-header-compact scoreboard ${shake ? 'shake' : ''}`}>
              <div className="sb-top">
                <span className="sb-quarter">Q{timer.quarter}</span>
                <span className={`sb-time ${timer.isRunning ? 'running' : ''}`}>{timer.formatTime()}</span>
                <button className="sb-play" onClick={timer.toggleTimer} aria-label={timer.isRunning ? 'Pause' : 'Lecture'}>
                  {timer.isRunning ? '⏸' : '▶'}
                </button>
                {timer.isRunning ? (
                  <span className="sb-live"><span className="sb-live-dot" />LIVE</span>
                ) : (
                  <span className="sb-paused">PAUSE</span>
                )}
                <button
                  className={`sb-court ${playingTime.isOnCourt ? 'on-court' : 'on-bench'}`}
                  onClick={playingTime.toggleOnCourt}
                >
                  {playingTime.isOnCourt ? '🏃' : '🪑'} {playingTime.formatPlayingTime(playingTime.playingTime)}
                </button>
              </div>
              {timer.isRunning && (
                <button
                  className="timeout-btn"
                  onClick={() => {
                    timer.toggleTimer()
                    setInactivityWarning(false)
                  }}
                >
                  ⏱️ Temps mort
                </button>
              )}

              {/* Inactivity warning */}
              {inactivityWarning && (
                <div className="inactivity-warning" onClick={() => setInactivityWarning(false)}>
                  ⚠️ Aucune action depuis 2 min — Toujours sur le terrain ?
                  <div className="inactivity-actions">
                    <button onClick={(e) => { e.stopPropagation(); setInactivityWarning(false); setLastActionTime(Date.now()); }}>
                      Oui
                    </button>
                    <button onClick={(e) => { e.stopPropagation(); playingTime.toggleOnCourt(); setInactivityWarning(false); setLastActionTime(Date.now()); }}>
                      Non
                    </button>
                  </div>
                </div>
              )}

              {/* Score en direct */}
              <div className="sb-score">
                <div className="sb-team us">
                  <span className="sb-team-label">NOUS</span>
                  <span key={liveScoreTeam} className="sb-score-value bump">{liveScoreTeam}</span>
                  <div className="sb-score-btns">
                    <button onClick={() => setLiveScoreTeam(Math.max(0, liveScoreTeam - 1))}>−</button>
                    <button onClick={(e) => { fx(e, 'us'); setLiveScoreTeam(liveScoreTeam + 1) }}>+</button>
                  </div>
                </div>
                <span className={`sb-diff ${liveScoreTeam > liveScoreOpponent ? 'up' : liveScoreTeam < liveScoreOpponent ? 'down' : ''}`}>
                  {liveScoreTeam === liveScoreOpponent ? '=' : `${liveScoreTeam > liveScoreOpponent ? '+' : ''}${liveScoreTeam - liveScoreOpponent}`}
                </span>
                <div className="sb-team them">
                  <span className="sb-team-label">EUX</span>
                  <span key={liveScoreOpponent} className="sb-score-value bump">{liveScoreOpponent}</span>
                  <div className="sb-score-btns">
                    <button onClick={() => setLiveScoreOpponent(Math.max(0, liveScoreOpponent - 1))}>−</button>
                    <button onClick={(e) => { fx(e, 'them'); setLiveScoreOpponent(liveScoreOpponent + 1) }}>+</button>
                  </div>
                </div>
              </div>

              {/* Ligne joueur */}
              <div className="sb-player">
                <div className="sb-player-id">
                  <span className="sb-player-name">{player.name || 'Joueur'}</span>
                  <span className="sb-player-number">#{player.number || '0'}</span>
                </div>
                <div className={`sb-pts ${streaks.currentStreak >= 2 ? 'hot' : ''}`}>
                  <span key={summary.totalPoints} className="sb-pts-value bump">{summary.totalPoints}</span>
                  <span className="sb-pts-label">PTS</span>
                  {streaks.currentStreak >= 2 && <span className="sb-streak">🔥×{streaks.currentStreak}</span>}
                </div>
                <div className="sb-mini">
                  <span><b>{summary.totalRebounds}</b> REB</span>
                  <span><b>{stats.assists}</b> PD</span>
                  <span><b>{stats.steals}</b> INT</span>
                </div>
              </div>
            </div>

            {/* Court + Stats side by side on wide screens */}
            <div className="match-body">
            <div className="match-body-court">
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
            </div>

            <div className="match-body-stats">
            {/* Tirs : réussi / raté */}
            <div className="stats-category">
              <h4 className="stats-category-title">TIRS</h4>
              <div className="shots-panel">
                <div className="shot-col">
                  <div className="shot-head">
                    <span className="shot-name">2 PTS</span>
                    <span className="shot-line">{stats.fg2Made}/{stats.fg2Attempted}</span>
                  </div>
                  <span className="shot-pct">{stats.fg2Attempted > 0 ? Math.round(stats.fg2Made / stats.fg2Attempted * 100) : 0}%</span>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn made" onClick={(e) => { tapFeedback(); fx(e, 'made2'); handleShotMadeIncrement('fg2Made', 'fg2Attempted', 2) }}>✓</button>
                    <button className="qs-minus" aria-label="Retirer un réussi" onClick={() => handleShotMadeDecrement('fg2Made', 'fg2Attempted', 2)}>−</button>
                  </div>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn missed" onClick={(e) => { tapFeedback(); fx(e, 'miss'); handleShotAttemptedIncrement('fg2Attempted') }}>✗</button>
                    <button className="qs-minus" aria-label="Retirer un raté" onClick={() => handleShotAttemptedDecrement('fg2Made', 'fg2Attempted')}>−</button>
                  </div>
                </div>
                <div className="shot-col">
                  <div className="shot-head">
                    <span className="shot-name">3 PTS</span>
                    <span className="shot-line">{stats.fg3Made}/{stats.fg3Attempted}</span>
                  </div>
                  <span className="shot-pct">{stats.fg3Attempted > 0 ? Math.round(stats.fg3Made / stats.fg3Attempted * 100) : 0}%</span>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn made" onClick={(e) => { tapFeedback(); fx(e, 'made3'); handleShotMadeIncrement('fg3Made', 'fg3Attempted', 3) }}>✓</button>
                    <button className="qs-minus" aria-label="Retirer un réussi" onClick={() => handleShotMadeDecrement('fg3Made', 'fg3Attempted', 3)}>−</button>
                  </div>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn missed" onClick={(e) => { tapFeedback(); fx(e, 'miss'); handleShotAttemptedIncrement('fg3Attempted') }}>✗</button>
                    <button className="qs-minus" aria-label="Retirer un raté" onClick={() => handleShotAttemptedDecrement('fg3Made', 'fg3Attempted')}>−</button>
                  </div>
                </div>
                <div className="shot-col">
                  <div className="shot-head">
                    <span className="shot-name">LF</span>
                    <span className="shot-line">{stats.ftMade}/{stats.ftAttempted}</span>
                  </div>
                  <span className="shot-pct">{stats.ftAttempted > 0 ? Math.round(stats.ftMade / stats.ftAttempted * 100) : 0}%</span>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn made" onClick={(e) => { tapFeedback(); fx(e, 'madeFT'); handleFreeThrowMadeIncrement() }}>✓</button>
                    <button className="qs-minus" aria-label="Retirer un réussi" onClick={() => handleFreeThrowMadeDecrement()}>−</button>
                  </div>
                  <div className="shot-btn-wrap">
                    <button className="sp-btn missed" onClick={(e) => { tapFeedback(); fx(e, 'miss'); handleFreeThrowMissedIncrement() }}>✗</button>
                    <button className="qs-minus" aria-label="Retirer un raté" onClick={() => handleFreeThrowMissedDecrement()}>−</button>
                  </div>
                </div>
              </div>
            </div>

            {/* Autres actions */}
            <div className="stats-category">
              <h4 className="stats-category-title">ACTIONS</h4>
              <div className="quick-stats-grid actions-grid">
                <div className="quick-stat">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'offRebounds'); updateStatWithTime('offRebounds', 1) }}>
                    <span className="qs-label">Reb Off</span>
                    <span key={stats.offRebounds} className="qs-value bump">{stats.offRebounds}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('offRebounds', -1)}>−</button>
                </div>
                <div className="quick-stat">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'defRebounds'); updateStatWithTime('defRebounds', 1) }}>
                    <span className="qs-label">Reb Def</span>
                    <span key={stats.defRebounds} className="qs-value bump">{stats.defRebounds}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('defRebounds', -1)}>−</button>
                </div>
                <div className="quick-stat">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'assists'); updateStatWithTime('assists', 1) }}>
                    <span className="qs-label">Passes</span>
                    <span key={stats.assists} className="qs-value bump">{stats.assists}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('assists', -1)}>−</button>
                </div>
                <div className="quick-stat">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'steals'); updateStatWithTime('steals', 1) }}>
                    <span className="qs-label">Inter</span>
                    <span key={stats.steals} className="qs-value bump">{stats.steals}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('steals', -1)}>−</button>
                </div>
                <div className="quick-stat">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'blocks'); updateStatWithTime('blocks', 1) }}>
                    <span className="qs-label">Contres</span>
                    <span key={stats.blocks} className="qs-value bump">{stats.blocks}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('blocks', -1)}>−</button>
                </div>
                <div className="quick-stat qs-negative">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'turnovers'); updateStatWithTime('turnovers', 1) }}>
                    <span className="qs-label">Pertes</span>
                    <span key={stats.turnovers} className="qs-value bump">{stats.turnovers}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('turnovers', -1)}>−</button>
                </div>
                <div className="quick-stat qs-negative">
                  <button className="qs-tap" onClick={(e) => { tapFeedback(); fx(e, 'fouls'); updateStatWithTime('fouls', 1) }}>
                    <span className="qs-label">Fautes</span>
                    <span key={stats.fouls} className="qs-value bump">{stats.fouls}</span>
                  </button>
                  <button className="qs-minus" aria-label="Retirer" onClick={() => updateStatWithTime('fouls', -1)}>−</button>
                </div>
              </div>
            </div>
            </div>
            </div>

            {/* Points Total Display */}
            <div className="points-total-display">
              <span className="pts-label">TOTAL</span>
              <span className="pts-value">{summary.totalPoints} PTS</span>
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
                  onNext={() => {
                    timer.nextQuarter()
                    const onCourt = confirm('Sur le terrain ?')
                    if (onCourt !== playingTime.isOnCourt) playingTime.toggleOnCourt()
                    // Sync Gist au changement de QT
                    if (githubToken && gistId && history.length > 0) {
                      pushToGist(history).catch(() => {})
                    }
                  }}
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

        {(activeTab === 'history' || activeTab === 'analysis') && (
          <div className="analysis-filter">
            <label>Saison :</label>
            <select
              value={season}
              onChange={(e) => { setSeason(e.target.value); setAnalysisSelectedMatchId('all') }}
              className="match-select"
            >
              {seasons.map(s => (
                <option key={s} value={s}>
                  {s}{s === currentSeason ? ' (en cours)' : ' (archive)'}
                </option>
              ))}
            </select>
          </div>
        )}

        {activeTab === 'history' && (
          <MatchHistory
            key={season}
            history={seasonHistory}
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

        {activeTab === 'as' && (
          <div className="training-page">
            <h2>🏫 AS de l'école</h2>
            <p className="training-desc">Note les points marqués pendant la séance</p>
            <div className="as-counter">{asPoints}</div>
            <p className="training-desc">points</p>
            <div className="as-buttons">
              <button className="training-reset" onClick={() => setAsPoints(p => Math.max(0, p - 1))}>−1</button>
              <button className="training-reset" onClick={() => setAsPoints(p => p + 1)}>+1</button>
              <button className="training-reset" onClick={() => setAsPoints(p => p + 2)}>+2</button>
              <button className="training-reset" onClick={() => setAsPoints(p => p + 3)}>+3</button>
            </div>
            <button
              className="training-reset"
              onClick={() => {
                setAsSessions(prev => [{ id: Date.now(), date: new Date().toISOString(), points: asPoints }, ...prev])
                setAsPoints(0)
              }}
            >
              💾 Enregistrer la séance
            </button>

            {asSessions.length > 0 && (
              <>
                <div className="training-stats">
                  <div className="training-stat">
                    <span className="ts-label">Séances</span>
                    <span className="ts-value">{asSessions.length}</span>
                  </div>
                  <div className="training-stat">
                    <span className="ts-label">Total</span>
                    <span className="ts-value">{asSessions.reduce((t, s) => t + s.points, 0)}</span>
                  </div>
                  <div className="training-stat">
                    <span className="ts-label">Moyenne</span>
                    <span className="ts-value">{(asSessions.reduce((t, s) => t + s.points, 0) / asSessions.length).toFixed(1)}</span>
                  </div>
                  <div className="training-stat total">
                    <span className="ts-label">Record</span>
                    <span className="ts-value">{Math.max(...asSessions.map(s => s.points))}</span>
                  </div>
                </div>
                <ul className="as-list">
                  {asSessions.map(s => (
                    <li key={s.id}>
                      <span>{new Date(s.date).toLocaleDateString('fr-FR', { weekday: 'short', day: 'numeric', month: 'short', year: 'numeric' })}</span>
                      <strong>{s.points} pts</strong>
                      <button onClick={() => confirm('Supprimer cette séance ?') && setAsSessions(prev => prev.filter(x => x.id !== s.id))}>×</button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>
        )}

        {activeTab === 'analysis' && (
          <div className="analysis-page">
            <h2>📈 Analyse des performances</h2>

            {seasonHistory.length === 0 ? (
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
                    {[...seasonHistory].reverse().map((match, index) => (
                      <option key={match.id} value={match.id}>
                        {new Date(match.date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short' })}
                        {match.opponent ? ` vs ${match.opponent}` : ` - Match ${seasonHistory.length - index}`}
                        {' '}({match.summary.points} pts)
                      </option>
                    ))}
                  </select>
                </div>

                {/* Shot Charts */}
                <div className="analysis-section">
                  <h3>🎯 Cartes des tirs</h3>
                  <div className="shot-charts-grid">
                    <ShotHeatmap history={seasonHistory} selectedMatchId={analysisSelectedMatchId} />
                    <ThermalHeatmap history={seasonHistory} selectedMatchId={analysisSelectedMatchId} />
                  </div>
                </div>

                {/* Performance Charts */}
                <div className="analysis-section">
                  <h3>📊 Graphiques de performance</h3>
                  <div className="charts-grid">
                    <EvolutionChart history={seasonHistory} />
                    <PerformanceRadar averages={averages} lastMatch={seasonHistory[seasonHistory.length - 1]} />
                  </div>
                </div>

                {/* Advanced Stats Section */}
                <div className="analysis-section">
                  <h3>📈 Stats avancées</h3>
                  {(() => {
                    // Calculate stats for selected match or all matches
                    const selectedMatch = analysisSelectedMatchId === 'all'
                      ? null
                      : seasonHistory.find(m => m.id === analysisSelectedMatchId)

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
                      const totals = seasonHistory.reduce((acc, m) => ({
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
                Choisis le style de l'app. Les thèmes clairs restent lisibles en plein soleil.
              </p>
              <div className="skin-grid">
                {SKINS.map(sk => (
                  <button
                    key={sk.id}
                    className={`skin-card ${skin === sk.id ? 'active' : ''}`}
                    onClick={() => setSkin(sk.id)}
                    style={{ '--sk-bg': sk.colors[0], '--sk-a': sk.colors[1], '--sk-b': sk.colors[2] }}
                  >
                    <span className="skin-swatch">
                      <span className="skin-emoji">{sk.emoji}</span>
                    </span>
                    <span className="skin-name">{sk.name}</span>
                  </button>
                ))}
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
                  className="gist-action-btn sync-btn"
                  onClick={handleSync}
                  disabled={gistLoading || !githubToken}
                >
                  {gistLoading ? '⏳' : '🔄'} Synchroniser
                </button>
                <button
                  className="gist-action-btn"
                  onClick={saveToGist}
                  disabled={gistLoading || history.length === 0 || !githubToken}
                >
                  {gistLoading ? '⏳' : '⬆️'} Forcer envoi
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

            {/* Affichage */}
            <div className="options-section">
              <h3>📱 Affichage</h3>
              <div className="option-toggle">
                <label>Mode entraînement</label>
                <button
                  className={`toggle-btn ${showTraining ? 'active' : ''}`}
                  onClick={() => {
                    setShowTraining(prev => !prev)
                    if (activeTab === 'training') setActiveTab('match')
                  }}
                >
                  {showTraining ? 'Activé' : 'Désactivé'}
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
