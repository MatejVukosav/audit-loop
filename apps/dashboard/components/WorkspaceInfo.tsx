import React from "react";

interface WorkspaceInfoProps {
  workspaceId: string;
  lastUpdated: Date | null;
}

export const WorkspaceInfo: React.FC<WorkspaceInfoProps> = ({
  workspaceId,
  lastUpdated,
}) => (
  <div className="bg-white/15 backdrop-blur-md rounded-2xl p-6 mb-10 border border-white/25 shadow-xl">
    <div className="flex items-center justify-between">
      <div>
        <h2 className="text-white text-2xl font-bold mb-2">
          📊 Workspace: <span className="text-blue-200">{workspaceId}</span>
        </h2>
        {lastUpdated && (
          <p className="text-blue-100 text-lg font-medium">
            Last updated: {lastUpdated.toLocaleTimeString()}
          </p>
        )}
      </div>
      <div className="text-4xl">🚀</div>
    </div>
  </div>
);
