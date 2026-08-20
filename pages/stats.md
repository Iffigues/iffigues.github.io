---
layout: default
title: Git Disk Analyzer Pro - Full History
custom_css:
  - /assets/css/git-analyzer.css
custom_js:
  - /assets/js/git-analyzer.js
---

<div id="git-app">
    
    <div class="analyzer-header">
        <input type="text" id="repoInput" class="analyzer-input-repo" placeholder="user/repo">
        <input type="password" id="tokenInput" class="analyzer-input-token" placeholder="Token (Optionnel)">
        <button id="btn-scan" class="analyzer-btn-scan">Scanner</button>
    </div>

    <div id="disk-section" class="disk-section">
        <div class="disk-grid">
            <div class="disk-card">
                <div class="disk-card-title">TOTAL QUOTA</div>
                <div class="disk-card-val">5.00 GB</div>
            </div>
            <div class="disk-card">
                <div class="disk-card-title">USED (.GIT)</div>
                <div id="diskUsed" class="disk-card-val used">-</div>
            </div>
            <div class="disk-card">
                <div class="disk-card-title">AVAILABLE</div>
                <div id="diskAvail" class="disk-card-val avail">-</div>
            </div>
            <div class="disk-card">
                <div class="disk-card-title">SNAPSHOT</div>
                <div id="snapshotSize" class="disk-card-val">-</div>
            </div>
        </div>
        <div class="progress-bar-container">
            <div id="barUsed" class="progress-bar-fill"></div>
        </div>
    </div>

    <div id="main-view" class="main-view">
        <div class="commits-panel">
            <div class="commits-header">COMMITS</div>
            <div id="commitList" class="commit-list"></div>
            <button id="loadMoreBtn" class="btn-load-more">Charger plus de commits...</button>
        </div>

        <div class="explorer-panel">
            <div class="explorer-toolbar">
                <div id="breadcrumb" class="breadcrumb"></div>
                <button id="btn-audit" class="btn-audit">🔍 Audit Fichiers Lourds</button>
            </div>
            <div class="explorer-table-container">
                <table class="explorer-table">
                    <tbody id="fileTable"></tbody>
                </table>
            </div>
        </div>
    </div>

</div>

<div id="suggestionModal" class="suggestion-modal">
    <h3 style="margin-top:0">Fichiers à optimiser</h3>
    <div id="suggestionList"></div>
    <button id="btn-close-modal" class="btn-modal-close">Fermer</button>
</div>
