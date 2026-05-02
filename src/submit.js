// submit.js

import { useState } from 'react';
import { useStore } from './store';
import { theme } from './styles/theme';
import { shallow } from 'zustand/shallow';

// ResultBanner sub-component
const ResultBanner = ({ result, error }) => {
    if (!result && !error) return null;

    const bannerStyle = {
        marginTop: '12px',
        padding: '10px 14px',
        borderRadius: theme.radii.button,
        fontSize: theme.font.sizeBase,
        fontFamily: theme.font.family,
        maxWidth: '320px',
        textAlign: 'left',
    };

    if (result) {
        return (
            <div
                style={{
                    ...bannerStyle,
                    backgroundColor: '#1a3a2a',
                    border: '1px solid #2e6b4a',
                    color: theme.colors.textPrimary,
                }}
                data-testid="result-banner-success"
            >
                <div><strong>Nodes:</strong> {result.num_nodes}</div>
                <div><strong>Edges:</strong> {result.num_edges}</div>
                <div><strong>Is DAG:</strong> {result.is_dag ? 'Yes' : 'No'}</div>
            </div>
        );
    }

    return (
        <div
            style={{
                ...bannerStyle,
                backgroundColor: '#3a1a1a',
                border: '1px solid #6b2e2e',
                color: '#f08080',
            }}
            data-testid="result-banner-error"
        >
            {error}
        </div>
    );
};

export const SubmitButton = () => {
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);
    const [error, setError] = useState(null);

    const { nodes, edges } = useStore(
        (state) => ({ nodes: state.nodes, edges: state.edges }),
        shallow
    );

    const handleSubmit = async () => {
        if (nodes.length === 0) {
            setError('Canvas is empty — add at least one node before submitting.');
            setResult(null);
            return;
        }

        const serializedNodes = nodes.map(({ id, type, data }) => ({ id, type, data }));
        const serializedEdges = edges.map(({ id, source, target, sourceHandle, targetHandle }) => ({
            id,
            source,
            target,
            sourceHandle: sourceHandle ?? null,
            targetHandle: targetHandle ?? null,
        }));

        setLoading(true);
        setResult(null);
        setError(null);

        try {
            const response = await fetch(
                process.env.REACT_APP_BACKEND_URL + '/pipelines/parse',
                {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ nodes: serializedNodes, edges: serializedEdges }),
                }
            );

            if (response.ok) {
                const data = await response.json();
                setResult(data);
            } else if (response.status >= 400 && response.status < 500) {
                let errorMessage = 'Bad request';
                try {
                    const body = await response.json();
                    if (body && body.error) {
                        errorMessage = body.error;
                    }
                } catch {
                    // body is not JSON — use default message
                }
                setError(errorMessage);
            } else if (response.status >= 500) {
                setError('Server error — please try again later');
            }
        } catch {
            setError('Network error — please try again');
        } finally {
            setLoading(false);
        }
    };

    const buttonStyle = {
        backgroundColor: loading ? theme.colors.accentHover : theme.colors.accent,
        color: theme.colors.textPrimary,
        borderRadius: theme.radii.button,
        border: 'none',
        padding: '8px 20px',
        fontSize: theme.font.sizeBase,
        fontFamily: theme.font.family,
        cursor: loading ? 'not-allowed' : 'pointer',
        opacity: loading ? 0.7 : 1,
    };

    return (
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <button
                type="submit"
                className="submit-btn"
                style={buttonStyle}
                disabled={loading}
                onClick={handleSubmit}
            >
                {loading ? 'Submitting...' : 'Submit'}
            </button>
            <ResultBanner result={result} error={error} />
        </div>
    );
};
