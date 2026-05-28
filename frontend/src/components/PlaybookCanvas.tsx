import React, { useState, useCallback, useEffect } from 'react';
import ReactFlow, { 
  Background, 
  Controls, 
  MiniMap,
  applyNodeChanges,
  applyEdgeChanges,
  addEdge,
  Handle,
  Position
} from 'reactflow';
import type { Node, Edge, NodeChange, EdgeChange, Connection } from 'reactflow';
import 'reactflow/dist/style.css';
import { Save, X, Plus, Play, Clock, HelpCircle, Activity, Zap } from 'lucide-react';
import { createPortal } from 'react-dom';

const InputHandle = () => (
  <Handle type="target" position={Position.Top} className="w-4 h-4 bg-slate-400 dark:bg-zinc-500 border-2 border-white dark:border-zinc-900" />
);
const OutputHandle = ({ colorClass = 'bg-purple-500' }: { colorClass?: string }) => (
  <Handle type="source" position={Position.Bottom} className={`w-4 h-4 ${colorClass} border-2 border-white dark:border-zinc-900`} />
);

const TriggerNode = ({ data, isConnectable }: any) => (
  <div className="bg-white dark:bg-zinc-900 border-2 border-sky-400/50 rounded-xl shadow-lg w-72">
    <div className="bg-sky-500/10 px-4 py-2 rounded-t-lg border-b border-sky-500/20 flex items-center gap-2">
      <Play size={14} className="text-sky-500" />
      <span className="text-xs font-bold text-sky-600 dark:text-sky-400 uppercase tracking-wider">Trigger</span>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <input 
        className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 dark:text-zinc-200 p-0"
        value={data.title}
        onChange={(e) => data.onChange(data.id, 'title', e.target.value)}
        placeholder="Trigger Name..."
      />
      <input 
        className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-sky-500/50"
        value={data.value}
        onChange={(e) => data.onChange(data.id, 'value', e.target.value)}
        placeholder="Type keyword to match..."
      />
    </div>
    <OutputHandle colorClass="bg-sky-500" />
  </div>
);

const ActionNode = ({ data, isConnectable }: any) => (
  <div className="bg-white dark:bg-zinc-900 border-2 border-purple-400/50 rounded-xl shadow-lg w-72">
    <InputHandle />
    <div className="bg-purple-500/10 px-4 py-2 rounded-t-lg border-b border-purple-500/20 flex items-center gap-2">
      <Zap size={14} className="text-purple-500" />
      <span className="text-xs font-bold text-purple-600 dark:text-purple-400 uppercase tracking-wider">Action</span>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <input 
        className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 dark:text-zinc-200 p-0"
        value={data.title}
        onChange={(e) => data.onChange(data.id, 'title', e.target.value)}
        placeholder="Action Name..."
      />
      <textarea 
        className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-purple-500/50 min-h-[60px]"
        value={data.value}
        onChange={(e) => data.onChange(data.id, 'value', e.target.value)}
        placeholder="What should the AI say or send?"
      />
    </div>
    <OutputHandle colorClass="bg-purple-500" />
  </div>
);

const ConditionNode = ({ data, isConnectable }: any) => (
  <div className="bg-white dark:bg-zinc-900 border-2 border-amber-400/50 rounded-xl shadow-lg w-72">
    <InputHandle />
    <div className="bg-amber-500/10 px-4 py-2 rounded-t-lg border-b border-amber-500/20 flex items-center gap-2">
      <HelpCircle size={14} className="text-amber-500" />
      <span className="text-xs font-bold text-amber-600 dark:text-amber-400 uppercase tracking-wider">Condition</span>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <input 
        className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 dark:text-zinc-200 p-0"
        value={data.title}
        onChange={(e) => data.onChange(data.id, 'title', e.target.value)}
        placeholder="Condition Name..."
      />
      <input 
        className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-amber-500/50"
        value={data.value}
        onChange={(e) => data.onChange(data.id, 'value', e.target.value)}
        placeholder="e.g. Check if business hours"
      />
    </div>
    <OutputHandle colorClass="bg-amber-500" />
  </div>
);

const DelayNode = ({ data, isConnectable }: any) => (
  <div className="bg-white dark:bg-zinc-900 border-2 border-slate-400/50 rounded-xl shadow-lg w-72">
    <InputHandle />
    <div className="bg-slate-500/10 px-4 py-2 rounded-t-lg border-b border-slate-500/20 flex items-center gap-2">
      <Clock size={14} className="text-slate-500" />
      <span className="text-xs font-bold text-slate-600 dark:text-slate-400 uppercase tracking-wider">Delay</span>
    </div>
    <div className="p-4 flex flex-col gap-3">
      <input 
        className="w-full bg-transparent border-none focus:outline-none text-sm font-bold text-slate-800 dark:text-zinc-200 p-0"
        value={data.title}
        onChange={(e) => data.onChange(data.id, 'title', e.target.value)}
        placeholder="Delay Name..."
      />
      <input 
        className="w-full bg-slate-50 dark:bg-zinc-950/50 border border-slate-200 dark:border-white/5 rounded-lg px-3 py-2 text-xs text-slate-700 dark:text-zinc-300 focus:outline-none focus:ring-1 focus:ring-slate-500/50"
        value={data.value}
        onChange={(e) => data.onChange(data.id, 'value', e.target.value)}
        placeholder="e.g. 15 minutes, 2 hours"
      />
    </div>
    <OutputHandle colorClass="bg-slate-500" />
  </div>
);

const nodeTypes = {
  trigger: TriggerNode,
  action: ActionNode,
  condition: ConditionNode,
  delay: DelayNode,
};

interface PlaybookCanvasProps {
  initialSteps: any[];
  onClose: () => void;
  onSave: (steps: any[]) => void;
}

export default function PlaybookCanvas({ initialSteps, onClose, onSave }: PlaybookCanvasProps) {
  const [nodes, setNodes] = useState<Node[]>([]);
  const [edges, setEdges] = useState<Edge[]>([]);

  const handleNodeChange = useCallback((id: string, field: string, value: string) => {
    setNodes((nds) =>
      nds.map((n) => {
        if (n.id === id) {
          n.data = { ...n.data, [field]: value };
        }
        return n;
      })
    );
  }, []);

  useEffect(() => {
    // Convert linear list to nodes/edges
    const initNodes: Node[] = [];
    const initEdges: Edge[] = [];
    
    if (initialSteps && initialSteps.length > 0) {
      initialSteps.forEach((step, index) => {
        initNodes.push({
          id: step.id,
          type: step.type,
          position: { x: 250, y: 50 + (index * 200) },
          data: { ...step, onChange: handleNodeChange }
        });
        
        if (index > 0) {
          initEdges.push({
            id: `e${initialSteps[index-1].id}-${step.id}`,
            source: initialSteps[index-1].id,
            target: step.id,
            animated: true,
            style: { stroke: '#a855f7', strokeWidth: 2 }
          });
        }
      });
    } else {
      initNodes.push({
        id: '1',
        type: 'trigger',
        position: { x: 250, y: 100 },
        data: { id: '1', title: '', value: '', onChange: handleNodeChange }
      });
    }
    
    setNodes(initNodes);
    setEdges(initEdges);
  }, [initialSteps, handleNodeChange]);

  const onNodesChange = useCallback((changes: NodeChange[]) => setNodes((nds) => applyNodeChanges(changes, nds)), []);
  const onEdgesChange = useCallback((changes: EdgeChange[]) => setEdges((eds) => applyEdgeChanges(changes, eds)), []);
  const onConnect = useCallback((params: Connection | Edge) => setEdges((eds) => addEdge({ ...params, animated: true, style: { stroke: '#a855f7', strokeWidth: 2 } }, eds)), []);

  const addNode = (type: 'trigger' | 'action' | 'condition') => {
    const id = Date.now().toString();
    const lastNode = nodes[nodes.length - 1];
    const yPos = lastNode ? lastNode.position.y + 200 : 100;
    
    const newNode: Node = {
      id,
      type,
      position: { x: 250, y: yPos },
      data: { id, title: '', value: '', type, onChange: handleNodeChange }
    };
    
    setNodes((nds) => [...nds, newNode]);
    
    // Auto-connect to the last node ONLY if the new node is not a Trigger 
    // (since Triggers are starting points and don't have input handles)
    if (lastNode && type !== 'trigger') {
      setEdges((eds) => [...eds, {
        id: `e${lastNode.id}-${id}`,
        source: lastNode.id,
        target: id,
        animated: true,
        style: { stroke: '#a855f7', strokeWidth: 2 }
      }]);
    }
  };

  const handleSave = () => {
    // Sort nodes by Y position to infer a linear array for the backend execution engine
    // (since our backend currently executes linearly for triggers -> actions)
    const sortedNodes = [...nodes].sort((a, b) => a.position.y - b.position.y);
    const stepsToSave = sortedNodes.map(n => ({
      id: n.id,
      type: n.type,
      title: n.data.title || '',
      value: n.data.value || ''
    }));
    onSave(stepsToSave);
  };

  const content = (
    <div className="fixed inset-0 z-[9999] flex flex-col bg-slate-100 dark:bg-[#0c0a10]">
      <div className="h-16 bg-white dark:bg-zinc-900 border-b border-slate-200 dark:border-white/5 flex items-center justify-between px-6 shrink-0 shadow-sm relative z-10 w-full">
        <div className="flex items-center gap-4">
          <button onClick={onClose} className="p-2 hover:bg-slate-100 dark:hover:bg-white/5 rounded-full transition-colors cursor-pointer">
            <X size={20} className="text-slate-500 dark:text-zinc-400" />
          </button>
          <div>
            <h2 className="text-lg font-bold text-slate-800 dark:text-zinc-100 flex items-center gap-2">
              <Activity size={18} className="text-purple-500" /> Visual Playbook Builder
            </h2>
            <p className="text-xs text-slate-500 dark:text-zinc-400">Drag & drop nodes to map your automation</p>
          </div>
        </div>
        
        <div className="flex items-center gap-4">
          <div className="flex bg-slate-100 dark:bg-zinc-950 p-1 rounded-xl border border-slate-200 dark:border-white/5">
            <button onClick={() => addNode('trigger')} className="px-3 py-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={14} /> Trigger
            </button>
            <button onClick={() => addNode('condition')} className="px-3 py-1.5 text-xs font-semibold text-amber-600 dark:text-amber-400 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={14} /> Condition
            </button>
            <button onClick={() => addNode('action')} className="px-3 py-1.5 text-xs font-semibold text-purple-600 dark:text-purple-400 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={14} /> Action
            </button>
            <button onClick={() => addNode('delay')} className="px-3 py-1.5 text-xs font-semibold text-slate-600 dark:text-slate-400 hover:bg-white dark:hover:bg-white/5 rounded-lg transition-colors flex items-center gap-1">
              <Plus size={14} /> Delay
            </button>
          </div>
          
          <button onClick={handleSave} className="w3-button-primary px-6 h-10 shadow-glow-purple flex items-center">
            <Save size={16} />
            <span className="ml-2">Save Flow</span>
          </button>
        </div>
      </div>
      
      <div className="flex-grow w-full relative h-full">
        <ReactFlow
          nodes={nodes}
          edges={edges}
          onNodesChange={onNodesChange}
          onEdgesChange={onEdgesChange}
          onConnect={onConnect}
          nodeTypes={nodeTypes}
          fitView
          className="bg-slate-50 dark:bg-[#0c0a10]"
        >
          <Background color="#a1a1aa" gap={16} size={1} />
          <Controls className="bg-white dark:bg-zinc-900 border-none shadow-lg fill-slate-700 dark:fill-zinc-300" />
          <MiniMap className="bg-white dark:bg-zinc-900 border border-slate-200 dark:border-white/10 shadow-lg" maskColor="rgba(0,0,0,0.1)" />
        </ReactFlow>
      </div>
    </div>
  );

  return createPortal(content, document.body);
}
