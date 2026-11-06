import React, { useState, useEffect } from 'react';
import { MediaManager } from '../../components/institutional/MediaManager';
import { UserContext, api } from '../../services/api';
import { AttentionRoute } from '../../types';

interface InstitutionalMediaPageProps {
  userContext: UserContext;
}

export const InstitutionalMediaPage: React.FC<InstitutionalMediaPageProps> = ({ userContext }) => {
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);

  useEffect(() => {
    const fetchRoutes = async () => {
      try {
        const allRoutes = await api.getRoutes();
        const myRoutes = allRoutes.filter((r) => r.entityId === userContext.entityId);
        setRoutes(myRoutes);
      } catch (err) {
        console.error('Error fetching institutional routes:', err);
      }
    };
    fetchRoutes();
  }, [userContext.entityId]);

  return (
    <div className="space-y-6">
      <MediaManager
        userContext={userContext}
        scope="institutional"
        routes={routes}
      />
    </div>
  );
};
