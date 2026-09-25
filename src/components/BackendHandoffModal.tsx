import React, { useState } from 'react';
import {
  Database,
  Terminal,
  Download,
  Copy,
  Check,
  RefreshCw,
  Code2,
  Server,
  Layers,
  FileCode,
  ShieldCheck,
} from 'lucide-react';
import { mongoStore } from '../services/mongoStore';
import { FLASK_BACKEND_FILES } from '../services/flaskCodeExporter';

interface BackendHandoffModalProps {
  onDataReset: () => void;
}

export const BackendHandoffModal: React.FC<BackendHandoffModalProps> = ({ onDataReset }) => {
  const [activeCodeFile, setActiveCodeFile] = useState<'app' | 'models' | 'requirements' | 'dataset'>('dataset');
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const dataset = mongoStore.exportMongoDataset();
  const datasetJson = JSON.stringify(dataset, null, 2);

  const handleCopy = (key: string, content: string) => {
    navigator.clipboard.writeText(content);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadDataset = () => {
    const blob = new Blob([datasetJson], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `aura_store_mongodb_dataset_${Date.now()}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleDownloadFlaskCode = () => {
    const blob = new Blob([FLASK_BACKEND_FILES.appPy], { type: 'text/x-python' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'app.py';
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleResetData = () => {
    if (window.confirm('Reset local MongoDB collections back to default showroom seed?')) {
      mongoStore.resetToSeed();
      onDataReset();
    }
  };

  return (
    <div id="backend-handoff-root" className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 text-left">
      {/* Header Banner */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-800/80 pb-6">
        <div>
          <div className="flex items-center gap-2">
            <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              Freelancer &amp; Client Handoff Suite
            </span>
            <span className="text-xs text-zinc-500 font-mono">Fast React + Flask + MongoDB Stack</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold text-white font-display mt-1 tracking-tight">
            Localhost MongoDB &amp; Python Flask Engine
          </h1>
          <p className="text-xs text-zinc-400 mt-1">
            Production-ready backend architecture, PyMongo document models, and BSON dataset export for business owners.
          </p>
        </div>

        {/* Action buttons */}
        <div className="flex flex-wrap items-center gap-3">
          <button
            id="reset-mongo-seed-btn"
            onClick={handleResetData}
            className="flex items-center gap-2 px-3.5 py-2 rounded-xl bg-zinc-800 hover:bg-zinc-700 text-zinc-300 hover:text-white text-xs font-semibold transition-colors"
            title="Reset to default seed dataset"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Reset Demo Seed</span>
          </button>
          <button
            id="download-mongo-dataset-btn"
            onClick={handleDownloadDataset}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-emerald-500 hover:bg-emerald-400 text-zinc-950 font-bold text-xs shadow-lg shadow-emerald-500/10 transition-all"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Export MongoDB Dataset (.json)</span>
          </button>
        </div>
      </div>

      {/* Connection & Architecture Highlights */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-emerald-400">
            <Database className="w-4 h-4" />
            <span>MongoDB Localhost URI</span>
          </div>
          <p className="font-mono text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800 select-all">
            mongodb://localhost:27017/aura_store
          </p>
          <p className="text-[11px] text-zinc-400">
            Database: <strong className="text-zinc-200">aura_store</strong> | Collections: <code className="text-amber-400">products</code>, <code className="text-amber-400">orders</code>
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <Server className="w-4 h-4" />
            <span>Python Flask REST Service</span>
          </div>
          <p className="font-mono text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800 select-all">
            http://localhost:5000/api
          </p>
          <p className="text-[11px] text-zinc-400">
            PyMongo cursor serialization, inventory atomicity, and tokenized payment verification.
          </p>
        </div>

        <div className="p-4 rounded-2xl bg-zinc-900/60 border border-zinc-800 space-y-2">
          <div className="flex items-center gap-2 font-bold text-sky-400">
            <ShieldCheck className="w-4 h-4" />
            <span>Cryptographic Gateway</span>
          </div>
          <p className="font-mono text-zinc-300 bg-zinc-950 p-2 rounded-lg border border-zinc-800">
            PCI-DSS Tokenization + Luhn
          </p>
          <p className="text-[11px] text-zinc-400">
            Raw cardholder data is zero-retained on backend; replaced with irreversible auth tokens.
          </p>
        </div>
      </div>

      {/* Code / Dataset Tabs */}
      <div className="rounded-3xl bg-zinc-900/70 border border-zinc-800 overflow-hidden shadow-xl">
        <div className="flex flex-wrap items-center justify-between px-6 py-4 bg-zinc-950 border-b border-zinc-800 gap-3">
          <div className="flex items-center gap-2 text-xs font-semibold">
            <button
              onClick={() => setActiveCodeFile('dataset')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeCodeFile === 'dataset'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Database className="w-3.5 h-3.5" />
              <span>Active MongoDB Dataset (JSON)</span>
            </button>
            <button
              onClick={() => setActiveCodeFile('app')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeCodeFile === 'app'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <FileCode className="w-3.5 h-3.5" />
              <span>Flask REST API (app.py)</span>
            </button>
            <button
              onClick={() => setActiveCodeFile('models')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeCodeFile === 'models'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>PyMongo Models (models.py)</span>
            </button>
            <button
              onClick={() => setActiveCodeFile('requirements')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg transition-all ${
                activeCodeFile === 'requirements'
                  ? 'bg-amber-400 text-zinc-950 font-bold'
                  : 'text-zinc-400 hover:text-white'
              }`}
            >
              <span>requirements.txt</span>
            </button>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                const code =
                  activeCodeFile === 'dataset'
                    ? datasetJson
                    : activeCodeFile === 'app'
                    ? FLASK_BACKEND_FILES.appPy
                    : activeCodeFile === 'models'
                    ? FLASK_BACKEND_FILES.modelsPy
                    : FLASK_BACKEND_FILES.requirements;
                handleCopy(activeCodeFile, code);
              }}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
            >
              {copiedKey === activeCodeFile ? (
                <>
                  <Check className="w-3.5 h-3.5 text-emerald-400" />
                  <span className="text-emerald-400">Copied!</span>
                </>
              ) : (
                <>
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copy Code</span>
                </>
              )}
            </button>

            {activeCodeFile === 'app' && (
              <button
                onClick={handleDownloadFlaskCode}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-zinc-800 hover:bg-zinc-700 text-zinc-200 text-xs font-medium transition-colors"
              >
                <Download className="w-3.5 h-3.5" />
                <span>Save app.py</span>
              </button>
            )}
          </div>
        </div>

        {/* Code Content Box */}
        <div className="p-6 bg-[#0a0a0c] font-mono text-xs overflow-x-auto max-h-[500px]">
          <pre className="text-zinc-300 leading-relaxed">
            {activeCodeFile === 'dataset' && datasetJson}
            {activeCodeFile === 'app' && FLASK_BACKEND_FILES.appPy}
            {activeCodeFile === 'models' && FLASK_BACKEND_FILES.modelsPy}
            {activeCodeFile === 'requirements' && FLASK_BACKEND_FILES.requirements}
          </pre>
        </div>
      </div>

      {/* Terminal Quickstart Guide for the Freelancer */}
      <div className="p-6 rounded-3xl bg-zinc-900/60 border border-zinc-800 space-y-4 text-xs">
        <div className="flex items-center gap-2 font-bold text-white font-display text-sm">
          <Terminal className="w-4 h-4 text-amber-400" />
          <span>Local Deployment Quickstart (For Client Handover)</span>
        </div>

        <div className="space-y-3 text-zinc-300">
          <div>
            <p className="font-semibold text-zinc-200 mb-1">1. Start Local MongoDB Daemon:</p>
            <code className="block bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-amber-300 font-mono">
              mongod --dbpath /usr/local/var/mongodb --port 27017
            </code>
          </div>
          <div>
            <p className="font-semibold text-zinc-200 mb-1">2. Import Active Product &amp; Order Collections:</p>
            <code className="block bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-amber-300 font-mono">
              mongoimport --db aura_store --collection products --file aura_store_mongodb_dataset.json --jsonArray
            </code>
          </div>
          <div>
            <p className="font-semibold text-zinc-200 mb-1">3. Launch Flask Backend Server:</p>
            <code className="block bg-zinc-950 p-2.5 rounded-xl border border-zinc-800 text-amber-300 font-mono">
              pip install -r requirements.txt && python app.py
            </code>
          </div>
        </div>
      </div>
    </div>
  );
};
