//@flow

import React from 'react'

import styled from 'styled-components/native'

import {
    Text,
    View,
    ScrollView,
    TextInput,
    FlatList,
    Platform,
    TouchableOpacity,
    Dimensions,
} from 'react-native'

import { Font } from 'expo'
import Modal from 'react-native-modal'
import { Ionicons } from '@expo/vector-icons'
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view'
import { sample, chunk } from 'lodash'

const BRAND_COLOR = '#78abbf'

const { height, width } = Dimensions.get('window')

type TodoCardProps = {
    handleDelete: string => void,
    name: string,
    isGrid?: boolean,
}

type TodoCardState = {
    text: string,
    list: Array<Object>,
    showModal?: boolean,
}
export default class TodoCard extends React.Component<
    TodoCardProps,
    TodoCardState
> {
    state = {
        text: '',
        list: [],
        showModal: false,
    }

    componentWillUpdate(nextProps: Object, nextState: Object) {
        const nextList = nextState.list
        const currentList = this.state.list

        if (nextList.length !== currentList.length) this.scrollToEnd()
    }

    handleNewEntry = (callback?: any => void) => {
        const { text, list } = this.state

        if (!text) return null

        const newList = [
            ...list,
            {
                key: `todo${new Date().getTime()}`,
                text: text,
            },
        ]

        this.setState(
            {
                list: newList,
                text: '',
            },
            () => callback && callback()
        )

        this.refs.entryInput.focus()
    }

    handleTextChange = (text: string) => {
        const hasSpace = text.search('\n')

        if (hasSpace !== -1)
            return this.handleNewEntry(() => this.scrollToEnd())

        this.setState({ text })
    }

    handleNewEntryAndMove = () => {
        this.handleNewEntry(() => this.scrollToEnd())
    }

    scrollToEnd = () => {
        this.refs['scrollView'].scrollToEnd()
    }

    handleMarkDone = (keyName: string) => {
        const updatedList = this.state.list.map(
            entry =>
                entry.key === keyName ? { ...entry, done: !entry.done } : entry
        )

        this.setState({
            list: updatedList,
        })
    }

    toggleModal = () => {
        this.setState({ showModal: !this.state.showModal })
    }

    renderInput() {
        const { list } = this.state

        const placeholderText = list.length
            ? 'Add item...'
            : 'Add first item :)'
        return (
            <InputContainer>
                <TextInput
                    style={{
                        flex: 1,
                        paddingLeft: 5,
                        fontFamily: 'robotoSlab',
                        height: 30,
                    }}
                    placeholder={placeholderText}
                    underlineColorAndroid="transparent"
                    ref="entryInput"
                    onChangeText={this.handleTextChange}
                    value={this.state.text}
                    multiline={true}
                    onBlur={() => {
                        //stupid android wont allow enter to do shit
                        Platform.OS === 'android' &&
                            this.handleNewEntryAndMove()
                    }}
                />
                <AddIcon onPress={() => this.handleNewEntryAndMove()}>
                    <Ionicons name="md-add" size={15} color={BRAND_COLOR} />
                </AddIcon>
            </InputContainer>
        )
    }

    renderListEntry = ({ item }: Object) => {
        const { isGrid } = this.props
        const strikeStyles = {}

        if (item.done) {
            strikeStyles.textDecorationLine = 'line-through'
            strikeStyles.opacity = 0.5
        }

        return (
            <ListEntry>
                <ListEntryTouchable
                    onPress={() => this.handleMarkDone(item.key)}
                >
                    <ListText style={strikeStyles}>{item.text}</ListText>
                </ListEntryTouchable>
            </ListEntry>
        )
    }

    renderModal() {
        const { showModal } = this.state

        return (
            <ModalCard
                isVisible={showModal}
                onBackdropPress={() => this.toggleModal()}
            >
                <View
                    style={{
                        flex: 1,
                        height: height / 2,
                    }}
                >
                    {this.renderCard()}
                </View>
            </ModalCard>
        )
    }

    renderCard() {
        const { list, showModal } = this.state
        const { name, isGrid, handleDelete } = this.props

        const doneList = list.filter(o => o.done)

        const showDelete = showModal && (
            <TouchableOpacity
                style={{
                    flex: 0,
                    height: 30,
                    justifyContent: 'center',
                }}
                onPress={() => {
                    this.toggleModal()
                    handleDelete(name)
                }}
            >
                <ListHeaderText numberOfLines={1}>Delete</ListHeaderText>
            </TouchableOpacity>
        )

        return (
            <Card
                isGrid={isGrid}
                style={{
                    borderLeftWidth: isGrid ? 0 : 1,
                }}
            >
                <CardHead>
                    <TouchableOpacity
                        style={{
                            flex: 3,
                            height: 30,
                            justifyContent: 'center',
                        }}
                        onPress={() => this.toggleModal()}
                    >
                        <ListHeaderText numberOfLines={1}>
                            {name.toUpperCase()}
                        </ListHeaderText>
                    </TouchableOpacity>
                    {showDelete}
                    {/* <ListHeaderText
                        style={{
                            alignItems: 'flex-end',
                            height: 30,
                            alignSelf: 'center',
                        }}
                    >
                        {doneList.length}/{list.length}
                    </ListHeaderText> */}
                </CardHead>

                <FlatList
                    ref="scrollView"
                    scrollEnabled={showModal}
                    data={list}
                    renderItem={this.renderListEntry}
                />
                {this.renderInput()}
            </Card>
        )
    }

    render() {
        const { showModal } = this.state

        return (
            <View>{!showModal ? this.renderCard() : this.renderModal()}</View>
        )
    }
}

//https://github.com/react-native-community/react-native-modal/issues/79
export const ModalCard = styled(Modal)`
    background-color: white;
    flex: 1;
    max-height: 400px;
`

const AddIcon = styled(TouchableOpacity)`
    padding: 5px;
`

const InputContainer = styled.View`
    flex-direction: row;
    border-color: #f1f1f1;
`

const ListIcon = styled.View`
    border: 1px solid ${BRAND_COLOR};
    height: 5px;
    width: 5px;
    border-radius: 50px;
    margin: 5px 2px 5px 0px;
`
const ListEntryTouchable = styled(TouchableOpacity)`
    flex-direction: row;
    /* min-height: 30px; */
    padding-bottom: 10px;
    justify-content: center;
    flex-direction: column;
    width: 100%;
`
const ListText = styled.Text`
    font-family: robotoSlab;
    opacity: 1;
`

const CardHead = styled.View`
    flex-direction: row;
    justify-content: space-between;

    padding: 2px 4px;
`

const ListHeaderText = styled.Text`
    opacity: 0.8;
    font-size: 14px;
    font-family: robotoSlabBold;
    color: ${BRAND_COLOR};
`

const ListEntry = styled.View`
    padding: 0px 4px;

    margin-bottom: 5px;
    flex-direction: row;
    border-color: #ddd;
`

const Card = styled.View`
    padding: ${p => (p.padding ? '5px' : '0px')};
    border: 1px solid #eee;
    border-top-width: 0px;
    border-left-width: 0px;
    height: 260px;
    width: 100%;
    background-color: white;
`
