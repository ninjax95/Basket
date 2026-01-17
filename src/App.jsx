import { useState, useEffect } from 'react'
import { useStats, usePlayer, useTimer, useMatchHistory, usePlayingTime } from './hooks/useStats'
import StatCounter from './components/StatCounter'
import Timer from './components/Timer'
import PlayerInfo from './components/PlayerInfo'
import StatsDisplay from './components/StatsDisplay'
import MatchHistory from './components/MatchHistory'
import CourtMap from './components/CourtMap'
import PinLock from './components/PinLock'
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
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
    background: rgba(0, 0, 0, 0.85);
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
`

export default function App() {
  const [isUnlocked, setIsUnlocked] = useState(false)
  const [activeTab, setActiveTab] = useState('match')
  const [opponent, setOpponent] = useState('')
  const [scoreTeam, setScoreTeam] = useState('')
  const [scoreOpponent, setScoreOpponent] = useState('')
  const [matchLocation, setMatchLocation] = useState('home') // 'home' or 'away'
  const [liveScoreTeam, setLiveScoreTeam] = useState(0)
  const [liveScoreOpponent, setLiveScoreOpponent] = useState(0)
  const [plusMinus, setPlusMinus] = useState(0)
  const [lastPlusMinusScore, setLastPlusMinusScore] = useState({ team: 0, opponent: 0 })
  const [shotMarkers, setShotMarkers] = useState(() => {
    const saved = localStorage.getItem('basketShotMarkers')
    return saved ? JSON.parse(saved) : []
  })
  const [githubToken, setGithubToken] = useState(() => {
    const saved = localStorage.getItem('basketGithubToken')
    return saved ? atob(saved) : ''
  })
  const [gistId, setGistId] = useState(() => localStorage.getItem('basketGistId') || '')
  const [showGistSettings, setShowGistSettings] = useState(false)
  const [gistLoading, setGistLoading] = useState(false)
  const [tempToken, setTempToken] = useState('')
  const [showActionPanel, setShowActionPanel] = useState(false)
  const [showReplay, setShowReplay] = useState(false)
  const [recordNotification, setRecordNotification] = useState(null) // { records: [...] }
  const [showHelpModal, setShowHelpModal] = useState(false)

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

  const { stats, updateStat, resetStats, importStats, getSummary, getEfficiency, actionHistory, getStatsByQuarter, undoLastAction } = useStats()
  const { player, updatePlayer } = usePlayer()
  const timer = useTimer()
  const { history, saveMatch, deleteMatch, clearHistory, importHistory, getAverages, getRecords, checkNewRecords } = useMatchHistory()
  const playingTime = usePlayingTime()

  const summary = getSummary()
  const averages = getAverages()
  const quarterStats = getStatsByQuarter()
  const efficiency = getEfficiency()

  // Track playing time when timer is running
  useEffect(() => {
    return playingTime.trackTime(timer.isRunning)
  }, [timer.isRunning, playingTime.isOnCourt])

  // Save shot markers to localStorage
  useEffect(() => {
    localStorage.setItem('basketShotMarkers', JSON.stringify(shotMarkers))
  }, [shotMarkers])

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

    // Use live score if manual score not entered
    const matchScore = {
      team: scoreTeam ? parseInt(scoreTeam) : (liveScoreTeam > 0 ? liveScoreTeam : null),
      opponent: scoreOpponent ? parseInt(scoreOpponent) : (liveScoreOpponent > 0 ? liveScoreOpponent : null)
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

    const savedMatch = saveMatch(player, stats, opponent, shotMarkers, matchScore, matchLocation, plusMinus)

    // Auto backup after save
    const updatedHistory = [...history, savedMatch]
    backupHistory(updatedHistory)

    // Show records notification if any
    if (newRecords.length > 0) {
      setRecordNotification({ records: newRecords })
    } else {
      alert('Match sauvegardé ! Backup téléchargé.')
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
    setScoreTeam('')
    setScoreOpponent('')
    setMatchLocation('home')
    setShotMarkers([])  // Clear shot markers
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
            if (confirm(`Restaurer ${data.history.length} match(s) depuis le backup du ${new Date(data.exportDate).toLocaleDateString('fr-FR')} ?\n\nCela remplacera l'historique actuel.`)) {
              importHistory(data.history)
              alert('Historique restauré avec succès !')
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
    setGithubToken(token)
    if (token) {
      localStorage.setItem('basketGithubToken', btoa(token))
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
            if (confirm(`Restaurer ${backupData.history.length} match(s) depuis le Gist ?\nBackup du ${new Date(backupData.exportDate).toLocaleDateString('fr-FR')}`)) {
              importHistory(backupData.history)
              setGistId(inputGistId)
              localStorage.setItem('basketGistId', inputGistId)
              alert('Historique restauré depuis GitHub Gist !')
            }
          } else {
            alert('Fichier de backup invalide dans le Gist.')
          }
        } else {
          alert('Fichier stats_basket_backup.json non trouvé dans le Gist.')
        }
      } else {
        alert('Gist non trouvé ou accès refusé.')
      }
    } catch (err) {
      alert(`Erreur: ${err.message}`)
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
      timer.resetTimer()
      playingTime.resetPlayingTime()
      setShotMarkers([])
      localStorage.setItem('basketShotMarkers', JSON.stringify([]))
      setOpponent('')
      setScoreTeam('')
      setScoreOpponent('')
      setMatchLocation('home')
      setLiveScoreTeam(0)
      setLiveScoreOpponent(0)
      setPlusMinus(0)
      setLastPlusMinusScore({ team: 0, opponent: 0 })
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

            {/* Live Score & +/- */}
            <div className="live-score-section">
              <h3>📊 Score en direct</h3>
              <div className="live-score-panel">
                <div className="live-score-team">
                  <span className="live-score-label">Équipe</span>
                  <div className="live-score-controls">
                    <button onClick={() => setLiveScoreTeam(Math.max(0, liveScoreTeam - 1))}>-</button>
                    <span className="live-score-value">{liveScoreTeam}</span>
                    <button onClick={() => setLiveScoreTeam(liveScoreTeam + 1)}>+</button>
                  </div>
                </div>
                <div className="live-score-separator">-</div>
                <div className="live-score-team">
                  <span className="live-score-label">Adversaire</span>
                  <div className="live-score-controls">
                    <button onClick={() => setLiveScoreOpponent(Math.max(0, liveScoreOpponent - 1))}>-</button>
                    <span className="live-score-value">{liveScoreOpponent}</span>
                    <button onClick={() => setLiveScoreOpponent(liveScoreOpponent + 1)}>+</button>
                  </div>
                </div>
              </div>
              <div className={`plus-minus-display ${plusMinus > 0 ? 'positive' : plusMinus < 0 ? 'negative' : ''}`}>
                <span className="pm-label">+/-</span>
                <span className="pm-value">{plusMinus > 0 ? '+' : ''}{plusMinus}</span>
              </div>
              <div className="efficiency-display">
                <div className="efficiency-stat">
                  <span className="eff-value">{efficiency.trueShootingPct}%</span>
                  <span className="eff-label">TS%</span>
                </div>
                <div className="efficiency-stat">
                  <span className="eff-value">{efficiency.gameScore}</span>
                  <span className="eff-label">Game Score</span>
                </div>
              </div>
            </div>

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

            <CourtMap
              onShotRecorded={handleShotRecorded}
              quarter={timer.quarter}
              timeLeft={timer.timeLeft}
              shotMarkers={shotMarkers}
              setShotMarkers={setShotMarkers}
              actionHistory={actionHistory}
              onShowReplay={() => setShowReplay(true)}
              onShowHistory={() => setShowActionPanel(true)}
            />

            <div className="stats-grid">
              <div className="stat-card">
                <h3>🎯 Points</h3>
                <StatCounter label="Tirs 2pts réussis" value={stats.fg2Made}
                  onIncrement={() => handleShotMadeIncrement('fg2Made', 'fg2Attempted', 2)}
                  onDecrement={() => handleShotMadeDecrement('fg2Made', 'fg2Attempted', 2)} />
                <StatCounter label="Tirs 2pts ratés" value={stats.fg2Attempted - stats.fg2Made}
                  onIncrement={() => handleShotAttemptedIncrement('fg2Attempted')}
                  onDecrement={() => handleShotAttemptedDecrement('fg2Made', 'fg2Attempted')} />
                <StatCounter label="Tirs 3pts réussis" value={stats.fg3Made}
                  onIncrement={() => handleShotMadeIncrement('fg3Made', 'fg3Attempted', 3)}
                  onDecrement={() => handleShotMadeDecrement('fg3Made', 'fg3Attempted', 3)} />
                <StatCounter label="Tirs 3pts ratés" value={stats.fg3Attempted - stats.fg3Made}
                  onIncrement={() => handleShotAttemptedIncrement('fg3Attempted')}
                  onDecrement={() => handleShotAttemptedDecrement('fg3Made', 'fg3Attempted')} />
                <StatCounter label="LF réussis" value={stats.ftMade}
                  onIncrement={handleFreeThrowMadeIncrement}
                  onDecrement={handleFreeThrowMadeDecrement} />
                <StatCounter label="LF ratés" value={stats.ftAttempted - stats.ftMade}
                  onIncrement={handleFreeThrowMissedIncrement}
                  onDecrement={handleFreeThrowMissedDecrement} />
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

            <StatsDisplay summary={summary} />

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
                <div className="score-inputs">
                  <input
                    type="number"
                    placeholder="Notre score"
                    value={scoreTeam}
                    onChange={(e) => setScoreTeam(e.target.value)}
                    className="score-input"
                    min="0"
                  />
                  <span className="score-separator">-</span>
                  <input
                    type="number"
                    placeholder="Score adv."
                    value={scoreOpponent}
                    onChange={(e) => setScoreOpponent(e.target.value)}
                    className="score-input"
                    min="0"
                  />
                </div>
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
        ) : null}

        {activeTab === 'history' && (
          <MatchHistory
            history={history}
            averages={averages}
            records={getRecords()}
            onDelete={handleDeleteMatch}
          />
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
                {/* Shot Charts */}
                <div className="analysis-section">
                  <h3>🎯 Cartes des tirs</h3>
                  <div className="shot-charts-grid">
                    <ShotHeatmap history={history} selectedMatchId="all" />
                    <ThermalHeatmap history={history} selectedMatchId="all" />
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
              </>
            )}
          </div>
        )}

        {activeTab === 'options' && (
          <div className="options-page">
            <h2>⚙️ Options</h2>

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
              <div className="action-panel-actions">
                <button className="undo-action-btn" onClick={undoLastAction} disabled={actionHistory.length === 0}>
                  ↩ Annuler dernière action
                </button>
              </div>
              <div className="action-panel-list">
                {actionHistory.length === 0 ? (
                  <div className="action-empty">Aucune action enregistrée</div>
                ) : (
                  actionHistory.map(action => (
                    <div key={action.id} className="action-item">
                      <span className="action-time">Q{action.quarter} {Math.floor(action.timeLeft / 60)}:{(action.timeLeft % 60).toString().padStart(2, '0')}</span>
                      <span className="action-label">{action.label}</span>
                    </div>
                  ))
                )}
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
                  <span className="help-term">REB</span>
                  <span className="help-def">Rebonds (offensifs + défensifs)</span>
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
