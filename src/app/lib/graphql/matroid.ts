export const GLOBAL_PANEL_QUERY = `
  query GlobalPanel {
    globals(first: 1) {
      id
      totalStaked
      rewardNotifiedTotal
      stakerCount
      totalDeposited
      targetTotal
      targetDuration
      claimWindow
      distributionStart
      totalDistributed
      baseBudget
      perProjectBudget
      mona
      registry
      scorer
      globalPool
      slashingContract
      projects { id }
      epochs { id }
    }
  }
`;

export const ENROLLMENTS_QUERY = `
  query Enrollments {
    enrollments(first: 1000, orderBy: leafIndex, orderDirection: asc) {
      commitment
      leafIndex
    }
  }
`;

export const POOL_EVENTS_QUERY = `
  query PoolEvents($bucket: Int!) {
    poolEvents(first: 1000, where: { bucket: $bucket }, orderBy: blockNumber, orderDirection: asc) {
      bucket
      kind
      commitment
      leafIndex
      root
      blockNumber
      logIndex
    }
  }
`;

export const PROJECTS_LIST_QUERY = `
  query ProjectsList {
    projects {
      id
    }
  }
`;

export const PROJECTS_PANEL_QUERY = `
  query ProjectsPanel {
    projects {
      id
      registeredAt
      monaIn
      monaOut
      monaTxCount
      monaUniqueUsers
      metadataUri
      metadata {
        title
        image
        description
        link
        languages
      }
    }
  }
`;

export const EPOCHS_LIST_QUERY = `
  query EpochsList {
    epochs(orderBy: epoch, orderDirection: desc) {
      id
      epoch
    }
  }
`;

export const EPOCHS_PANEL_QUERY = `
  query EpochsPanel {
    globals(first: 1) {
      epochs(orderBy: epoch, orderDirection: desc) {
        id
        epoch
        totalScore
        activeProjects
        budget
        blockTimestamp
      }
    }
  }
`;
