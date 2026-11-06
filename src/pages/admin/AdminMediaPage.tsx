import React, { useState, useEffect } from 'react';
import { MediaManager } from '../../components/institutional/MediaManager';
import { UserContext, api } from '../../services/api';
import { AttentionRoute, Entity } from '../../types';

interface AdminMediaPageProps {
  userContext: UserContext;
}

export const AdminMediaPage: React.FC<AdminMediaPageProps> = ({ userContext }) => {
  const [routes, setRoutes] = useState<AttentionRoute[]>([]);
  const [entities, setEntities] = useState<Entity[]>([]);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [r, e] = await Promise.all([api.getRoutes(), api.getEntities()]);
        setRoutes(r);
        setEntities(e);
      } catch (err) {
        console.error('Error fetching data for admin media:', err);
      }
    };
    fetchData();
  }, []);

  return (
    <div className="space-y-6">
      <MediaManager
        userContext={userContext}
        scope="admin"
        routes={routes}
        entities={entities}
      />
    </div>
  );
};
