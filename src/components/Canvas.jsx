import React, { useState, useRef, useCallback, useEffect } from 'react';
import { Trash2, Minus } from 'lucide-react';
import { NODE_TYPES } from '../data/problems';

const W = 2000, H = 1200, NW = 140, NH = 70;

export default function Canvas({ nodes, setNodes, connections, setConnections }) {
  const canvasRef = useRef(null);
  const [drag, setDrag]       = useState(null);   // { id, ox, oy }
  const [linking, setLinking] = useState(null);    // nodeId
  const [mouse, setMouse]     = useState({ x: 0, y: 0 });
  const [selNode, setSelNode] = useState(null);
  const [selConn, setSelConn] = useState(null);

  /* ── palette drag → canvas drop ── */
  const onPaletteDrag = (e, nt) => { e.dataTransfer.setData('nt', JSON.stringify(nt)); e.dataTransfer.effectAllowed = 'copy'; };
  const onCanvasDrop  = e => {
    e.preventDefault();
    const d = e.dataTransfer.getData('nt');
    if (!d) return;
    const nt   = JSON.parse(d);
    const rect = canvasRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left + canvasRef.current.scrollLeft - NW / 2;
    const y = e.clientY - rect.top  + canvasRef.current.scrollTop  - NH / 2;
    setNodes(p => [...p, { id: `n-${Date.now()}-${Math.random().toString(36).slice(2,7)}`, type: nt.type, label: nt.label, icon: nt.icon, color: nt.color, x: Math.max(0, x), y: Math.max(0, y) }]);
  };

  /* ── node drag on canvas ── */
  const onNodeDown = (e, id) => {
    if (e.target.classList.contains('node-port')) return;
    e.stopPropagation();
    const n = nodes.find(n => n.id === id);
    const r = canvasRef.current.getBoundingClientRect();
    setDrag({ id, ox: e.clientX - r.left + canvasRef.current.scrollLeft - n.x,
                  oy: e.clientY - r.top  + canvasRef.current.scrollTop  - n.y });
    setSelNode(id); setSelConn(null);
  };

  const onMove = useCallback(e => {
    const r = canvasRef.current?.getBoundingClientRect();
    if (!r) return;
    const x = e.clientX - r.left + canvasRef.current.scrollLeft;
    const y = e.clientY - r.top  + canvasRef.current.scrollTop;
    setMouse({ x, y });
    if (drag) {
      setNodes(p => p.map(n => n.id === drag.id ? { ...n, x: Math.max(0, x - drag.ox), y: Math.max(0, y - drag.oy) } : n));
    }
  }, [drag, setNodes]);

  const onUp = useCallback(() => setDrag(null), []);

  useEffect(() => {
    if (drag) { window.addEventListener('mousemove', onMove); window.addEventListener('mouseup', onUp); }
    return () => { window.removeEventListener('mousemove', onMove); window.removeEventListener('mouseup', onUp); };
  }, [drag, onMove, onUp]);

  /* ── connections ── */
  const onPort = (e, id, type) => {
    e.stopPropagation();
    if (type === 'output') { setLinking(id); }
    else if (type === 'input' && linking && linking !== id) {
      if (!connections.some(c => c.from === linking && c.to === id))
        setConnections(p => [...p, { id: `c-${Date.now()}`, from: linking, to: id }]);
      setLinking(null);
    }
  };
  const onCanvasClick = e => {
    if (e.target === canvasRef.current || e.target.closest('.canvas-bg')) {
      setLinking(null); setSelNode(null); setSelConn(null);
    }
  };

  const delNode = id => { setNodes(p => p.filter(n => n.id !== id)); setConnections(p => p.filter(c => c.from !== id && c.to !== id)); setSelNode(null); };
  const delConn = id => { setConnections(p => p.filter(c => c.id !== id)); setSelConn(null); };

  const portPos = (id, type) => {
    const n = nodes.find(n => n.id === id);
    if (!n) return { x: 0, y: 0 };
    return type === 'output' ? { x: n.x + NW / 2, y: n.y + NH } : { x: n.x + NW / 2, y: n.y };
  };

  const path = (from, to) => {
    const a = portPos(from, 'output'), b = portPos(to, 'input');
    const off = Math.abs(b.y - a.y) * 0.5;
    return `M ${a.x} ${a.y} C ${a.x} ${a.y + off}, ${b.x} ${b.y - off}, ${b.x} ${b.y}`;
  };

  return (
    <div className="flex h-full">
      {/* ── Palette ── */}
      <div className="w-[140px] bg-nl-bg border-r border-nl-border p-2 overflow-y-auto flex-shrink-0">
        <h3 className="text-[10px] font-semibold text-nl-muted uppercase tracking-wider mb-3 px-1">Components</h3>
        {NODE_TYPES.map(nt => (
          <div key={nt.type} draggable onDragStart={e => onPaletteDrag(e, nt)}
               className="palette-item flex items-center gap-2 px-2 py-2 rounded-lg mb-1 hover:bg-nl-card border border-transparent hover:border-nl-border transition-all"
               title={`Drag to add ${nt.label}`}>
            <span className="text-lg flex-shrink-0">{nt.icon}</span>
            <span className="text-[11px] text-nl-muted leading-tight">{nt.label}</span>
          </div>
        ))}
      </div>

      {/* ── Canvas ── */}
      <div className="flex-1 relative overflow-hidden">
        {/* toolbar */}
        <div className="absolute top-2 right-2 z-10 flex items-center gap-2">
          {selNode && (
            <button onClick={() => delNode(selNode)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors border border-red-500/20">
              <Trash2 className="w-3.5 h-3.5" />Delete Node
            </button>)}
          {selConn && (
            <button onClick={() => delConn(selConn)}
                    className="flex items-center gap-1.5 px-3 py-1.5 bg-red-500/10 hover:bg-red-500/20 text-red-400 rounded-lg text-xs font-medium transition-colors border border-red-500/20">
              <Minus className="w-3.5 h-3.5" />Delete Connection
            </button>)}
          <div className="text-[10px] text-nl-muted bg-nl-card px-2 py-1 rounded">{nodes.length} nodes · {connections.length} connections</div>
        </div>

        {linking && (
          <div className="absolute top-2 left-2 z-10 text-xs text-nl-primary bg-nl-primary/10 px-3 py-1.5 rounded-lg border border-nl-primary/30 animate-pulse">
            Click an input port (top) on another node to connect
          </div>)}

        <div ref={canvasRef}
             className="w-full h-full overflow-auto"
             onDrop={onCanvasDrop} onDragOver={e => { e.preventDefault(); e.dataTransfer.dropEffect = 'copy'; }}
             onClick={onCanvasClick}
             onMouseMove={e => { const r = canvasRef.current.getBoundingClientRect(); setMouse({ x: e.clientX - r.left + canvasRef.current.scrollLeft, y: e.clientY - r.top + canvasRef.current.scrollTop }); }}
             style={{ background: 'radial-gradient(circle, #1e2130 1px, transparent 1px)', backgroundSize: '24px 24px' }}>
          <div className="canvas-bg relative" style={{ width: W, height: H, minWidth: '100%', minHeight: '100%' }}>

            {/* SVG layer */}
            <svg className="absolute inset-0 pointer-events-none" width={W} height={H}>
              <defs>
                <marker id="ah" markerWidth="10" markerHeight="7" refX="10" refY="3.5" orient="auto">
                  <polygon points="0 0, 10 3.5, 0 7" fill="#3B82F6" />
                </marker>
              </defs>
              {connections.map(c => (
                <path key={c.id} d={path(c.from, c.to)} className="connection-path" markerEnd="url(#ah)"
                      style={{ pointerEvents: 'stroke', strokeWidth: selConn === c.id ? 3 : 2, stroke: selConn === c.id ? '#EF4444' : '#3B82F6' }}
                      onClick={e => { e.stopPropagation(); setSelConn(c.id); setSelNode(null); }} />
              ))}
              {linking && <line x1={portPos(linking, 'output').x} y1={portPos(linking, 'output').y}
                                x2={mouse.x} y2={mouse.y} stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 3" opacity="0.6" />}
            </svg>

            {/* Nodes */}
            {nodes.map(n => (
              <div key={n.id}
                   className={`canvas-node rounded-xl border-2 bg-nl-card shadow-lg flex flex-col items-center justify-center gap-1 select-none ${selNode === n.id ? 'ring-2 ring-nl-primary' : ''}`}
                   style={{ left: n.x, top: n.y, width: NW, height: NH, borderColor: n.color || '#2D3748' }}
                   onMouseDown={e => onNodeDown(e, n.id)}>
                <div className="node-port absolute -top-[7px] left-1/2 -translate-x-1/2" onClick={e => onPort(e, n.id, 'input')} />
                <span className="text-xl leading-none">{n.icon}</span>
                <span className="text-[10px] text-nl-text font-medium text-center leading-tight px-1">{n.label}</span>
                <div className="node-port absolute -bottom-[7px] left-1/2 -translate-x-1/2" onClick={e => onPort(e, n.id, 'output')} />
              </div>
            ))}

            {/* Empty state */}
            {nodes.length === 0 && (
              <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                <div className="text-center">
                  <div className="text-4xl mb-3 opacity-30">🏗️</div>
                  <p className="text-nl-muted text-sm">Drag components from the palette to build your architecture</p>
                  <p className="text-nl-border text-xs mt-2">Click output ports (bottom) → input ports (top) to connect</p>
                </div>
              </div>)}
          </div>
        </div>
      </div>
    </div>
  );
}
