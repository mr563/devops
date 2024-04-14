import React from 'react';
import ForgeReconciler, { Text, useProductContext } from '@forge/react';
import { requestJira } from '@forge/bridge';

const App = () => {
  const context = useProductContext();

  // add these code to keep track of comments
  const [comments, setComments] = React.useState();
  console.log(`Number of comments on this issue: ${comments?.length}`);

  const fetchCommentsForIssue = async (issueIdOrKey) => {
    const res = await requestJira(`/rest/api/3/issue/${issueIdOrKey}/comment`);
    const data = await res.json();
    return data.comments;
  };

  React.useEffect(() => {
    if (context) {
      // extract issue ID from the context
      const issueId = context.extension.issue.id;

      fetchCommentsForIssue(issueId).then(setComments);
    }
  }, [context]);

  // render the value of `comments` variable
  return (
    <>
      <Text>Hello world!</Text>
      <Text>
        Number of comments on this issue: {comments?.length}
      </Text>
    </>
  );
};

ForgeReconciler.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);