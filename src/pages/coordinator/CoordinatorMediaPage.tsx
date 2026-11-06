import React, { useState, useEffect } from 'react';
import { MediaManager } from '../../components/institutional/MediaManager';
import { UserContext, api } from '../../services/api';
import { AttentionRoute, Entity } from '../../types';

interface CoordinatorMediaPageProps {
  userContext: UserContext;
}

export const CoordinatorMediaPage: React.FC<CoordinatorMediaPageProps> = ({ userContext }) => {
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, e] = await Promise.all([api.getRoutes(), api.getEntities()]);
        setRoutes(r);
        setEntities(e);
      } catch (err) {
        console.error('Error fetching data for coordinator media:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <MediaManager
        userContext={userContext}
        scope="coordinator"
        routes={routes}
        entities={entities}
      />
    </div>
  );
};
