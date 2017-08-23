import React, { Component } from 'react'
import { connect } from 'react-redux'
import _ from 'underscore'

import { fetchDatabases, fetchSegments } from "metabase/redux/metadata";
import LoadingAndErrorWrapper from "metabase/components/LoadingAndErrorWrapper";
import EntitySearch from "metabase/containers/EntitySearch";
import { getMetadata, getMetadataFetched } from "metabase/selectors/metadata";

import Metadata from "metabase-lib/lib/metadata/Metadata";
import type { Segment } from "metabase/meta/types/Segment";
import EmptyState from "metabase/components/EmptyState";

const mapStateToProps = state => ({
    metadata: getMetadata(state),
    metadataFetched: getMetadataFetched(state)
})
const mapDispatchToProps = {
    fetchSegments,
    fetchDatabases,
}

@connect(mapStateToProps, mapDispatchToProps)
export default class SegmentSearch extends Component {
    props: {
        metadata: Metadata,
        metadataFetched: any,
        fetchSegments: () => void,
        fetchDatabases: () => void,
        onChooseSegment: (Segment) => void
    }

    componentDidMount() {
        this.props.fetchDatabases() // load databases if not loaded yet
        this.props.fetchSegments(true) // segments may change more often so always reload them
    }

    render() {
        const { metadataFetched, metadata, onChooseSegment } = this.props;

        const isLoading = !metadataFetched.segments || !metadataFetched.databases

        return (
            <LoadingAndErrorWrapper loading={isLoading}>
                {() => {
                    // TODO Atte Keinänen 8/22/17: If you call `/api/table/:id/table_metadata` it returns
                    // all segments (also retired ones) and they are missing both `is_active` and `creator` props. Currently this
                    // filters them out but we should definitely update the endpoints in the upcoming metadata API refactoring.
                    const sortedActiveSegments = _.chain(metadata.segmentsList())
                        .filter((segment) => segment.isActive())
                        .sortBy(({name}) => name.toLowerCase())
                        .value()

                    if (sortedActiveSegments.length > 0) {
                        return <EntitySearch
                            title="Which segment?"
                            entities={sortedActiveSegments}
                            chooseEntity={onChooseSegment}
                        />
                    } else {
                        return (
                            <div className="mt2 flex-full flex align-center justify-center bg-slate-extra-light">
                                <EmptyState
                                    message={<span>Defining common segments for your team makes it even easier to ask questions</span>}
                                    image="/app/img/segments_illustration"
                                    action="How to create segments"
                                    link="http://www.metabase.com/docs/latest/administration-guide/07-segments-and-metrics.html"
                                    className="mt2"
                                    imageClassName="mln2"
                                />
                            </div>
                        )
                    }
                }}
            </LoadingAndErrorWrapper>
        )
    }

}

