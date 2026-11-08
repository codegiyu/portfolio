const baseUrl = process.env.LIGHTHOUSE_URL || process.env.E2E_BASE_URL;

module.exports = {
  ci: {
    collect: {
      url: [`${baseUrl}/`, `${baseUrl}/projects`, `${baseUrl}/blog`],
      numberOfRuns: 1,
      settings: {
        preset: 'perf',
        onlyCategories: ['performance', 'accessibility', 'seo'],
      },
    },
    assert: {
      assertions: {
        'categories:performance': ['error', { minScore: 0.9 }],
        'categories:accessibility': ['error', { minScore: 0.9 }],
        'categories:seo': ['error', { minScore: 0.9 }],
        'largest-contentful-paint': ['error', { maxNumericValue: 2500 }],
        'cumulative-layout-shift': ['error', { maxNumericValue: 0.1 }],
        interactive: ['error', { maxNumericValue: 3500 }],
      },
    },
    upload: {
      target: 'filesystem',
      outputDir: 'output/lighthouse',
    },
  },
};
