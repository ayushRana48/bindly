import React, { useEffect, useState, useCallback, useRef } from "react";
import {
  View,
  Pressable,
  Image,
  StyleSheet,
  ActivityIndicator,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
  Platform,
  Keyboard,
} from "react-native";
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { Post, Comment, UserGroup, GroupData } from '../../types';
import { RootStackParamList } from '../../types';

// @ts-ignore
import placeholder from '../../assets/GroupIcon.png';
// @ts-ignore
import backArrow from '../../assets/backArrow.png';
// @ts-ignore
import settings from '../../assets/settings.png';
import { useGroupsContext } from "../GroupsContext";
import { useUserContext } from "../../UserContext";
// @ts-ignore
import members from '../../assets/members.png'
// @ts-ignore
import info from '../../assets/info.png';
import PostItem from './components/PostItem';
import BottomSheetScrollView from './components/BottomSheetScrollView';
import CommentsModal from "./components/groupScreenComponents/CommentsModal";
import LikesModal from "./components/groupScreenComponents/LikesModal";
import GroupHeader from "./components/groupScreenComponents/GroupHeader";

interface GroupScreenProps {
  route: RouteProp<RootStackParamList, 'Group'>;
}

interface GroupScreenNavigationProp extends NativeStackNavigationProp<RootStackParamList, 'Group'> { }

const screenWidth = Dimensions.get('window').width;

const GroupScreen: React.FC<GroupScreenProps> = () => {
  const route = useRoute<RouteProp<RootStackParamList, 'Group'>>();
  const { groupData } = route.params;
  const [imageUrl, setImageUrl] = useState<string>("");
  const [loading, setLoading] = useState<boolean>(true);
  const navigation = useNavigation<GroupScreenNavigationProp>();
  const { groupData: gd, setGroupData, setGroups } = useGroupsContext();
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const { user } = useUserContext();
  const [posts, setPosts] = useState<Post[]>([]);
  const [visiblePosts, setVisiblePosts] = useState<Post[]>([]);
  const [page, setPage] = useState<number>(1);
  const [groupUsers, setGroupUsers] = useState<UserGroup[]>([]);
  const [createStatus, setCreateStatus] = useState<'post' | 'edit'>('post');
  const [commentsHash, setCommentsHash] = useState<Record<string, Comment[]>>({});
  const [viewHeight, setViewHeight] = useState<number>(0);

  const postsPerPage = 5;

  const [commentsModalVisible, setCommentsModalVisible] = useState<boolean>(false);
  const [selectedPostComments, setSelectedPostComments] = useState<Comment[]>([]);
  const [likesModalVisible, setLikesModalVisible] = useState<boolean>(false);
  const [selectedPostLikes, setSelectedPostLikes] = useState<string[]>([]);
  const [selectedPostId, setSelectedPostId] = useState<string | null>(null);
  const [commentText, setCommentText] = useState<string>('');
  const bottomSheetRef = useRef<any>(null);
  const bottomSheetRef2 = useRef<any>(null);

  useEffect(() => {
    const keyboardDidShowListener = Keyboard.addListener(
      'keyboardDidShow',
      (e: any) => {
        // Handle keyboard show
      }
    );
    const keyboardDidHideListener = Keyboard.addListener(
      'keyboardDidHide',
      () => {
        // Handle keyboard hide
      }
    );

    return () => {
      keyboardDidShowListener.remove();
      keyboardDidHideListener.remove();
    };
  }, []);



  useEffect(() => {
    if (gd?.group) {
      setImageUrl(gd.group.pfp || "");
      setPosts(gd.post || []);
      setVisiblePosts((gd.post || []).slice(0, page * postsPerPage));
      setGroupUsers(gd.usergroup || []);
    }

    const dict: Record<string, Comment[]> = {};
    if (gd?.post) {
      gd.post.forEach((p: Post) => {
        dict[p.postid] = p.comment || [];
      });
    }
    setCommentsHash(dict);
  }, [gd, page, postsPerPage]);


  const started = new Date(groupData.startdate) < new Date();
  const ended = new Date(groupData.enddate) < new Date();
  const totalUsers = groupUsers.length;
  const groupId = groupData.groupid;

  // Post update functions
  const updatePostVeto = (updatedPost: Post): void => {
    setGroupData((g: GroupData) => {
      const newPosts = g.post?.map((p: Post) => (p.postid === updatedPost.postid ? updatedPost : p));
      return { ...g, post: newPosts };
    });
  };

  const updatePostLikes = (updatedPostId: string, username: string): void => {
    setGroupData((g: GroupData) => {
      const newPosts = g.post?.map((p: Post) => {
        if (p.postid === updatedPostId) {
          const isLiked = p.likes?.includes(username);
          const updatedLikes = isLiked
            ? (p.likes || []).filter((like) => like !== username)
            : [...(p.likes || []), username];
          return { ...p, likes: updatedLikes };
        }
        return p;
      });
      return { ...g, post: newPosts };
    });
  };


  const removePost = (deletedPostId: string): void => {
    setGroupData((g: GroupData) => {
      const newPosts = g.post?.filter((p: Post) => p.postid !== deletedPostId);
      return { ...g, post: newPosts };
    });
  };

  const addComment = (comment: Comment, postid: string): void => {
    setGroupData((g: GroupData) => {
      const newPosts = g.post?.map((p: Post) => {
        if (p.postid === postid) {
          const commentList = [...(p.comment || []), { ...comment, users: { pfp: user?.pfp || '' } }];
          return { ...p, comment: commentList };
        }
        return p;
      });
      return { ...g, post: newPosts };
    });
  };


  const getUserPfp = (username: string) => {
    return usersHashmap[username];
  };


  const usersHash = (): any => {
    const dict: any = {};
    if (gd?.usergroup) {
      gd.usergroup.forEach((p: UserGroup) => {
        dict[p.username] = p.users?.pfp || '';
      });
    }
    return dict;
  };

  const usersHashmap = usersHash();



  const getGroup = async (): Promise<void> => {
    try {
      const isInGroup = await inGroup();

      if (!isInGroup) {
        Alert.alert("Invalid Group", "Group has been deleted or not in group");
        navigation.navigate('GroupsList');
        setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
        return;
      }
    } catch (err) {
      console.error(err);
    }
    try {
      // 1. Fetch group data
      
      const response = await fetch(`http://localhost:3000/bindly/group/${groupData.groupid}`, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();


      // 3. Update group state
      setGroupData(res);
      setPosts(res.post || []);
      setGroupUsers(res.usergroup);
      setVisiblePosts((res.post || []).slice(0, postsPerPage));

      // 4. Fetch post status
      const postStatusResponse = await fetch(`http://localhost:3000/bindly/post/postStatus`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' }, 
        body: JSON.stringify({
          username: user?.username || '',
          groupId: groupData.groupid
        }),
      });

      // 5. Handle post status response
      if (!postStatusResponse.ok) {
        const errorResponse = await postStatusResponse.json();
        if (errorResponse.message === 'JSON object requested, multiple (or no) rows returned]') {
          setCreateStatus('post');
          return;
        }
        throw new Error(errorResponse.error || 'Failed to fetch post status');
      }

      const postStatusData = await postStatusResponse.json();

      // 6. Update post status state
      if (postStatusData) {
        setGroupData((g: GroupData) => ({
          ...g,
          createStatus: postStatusData.data,
          timecycle: postStatusData.startdate
        }));
        setCreateStatus(postStatusData.data);
      }
    }
    catch (error) {
      console.error(error);
      if (error instanceof Error &&
        error.message === 'JSON object requested, multiple (or no) rows returned') {
        Alert.alert("Invalid Group", "Group has been deleted");
        navigation.navigate('GroupsList');
        setGroups(g => g.filter(h => h.groupid !== groupData.groupid));
      }
    } finally {
      setLoading(false);
    }
  };


  const inGroup = async (): Promise<boolean> => {
    try {
      const response = await fetch(`http://localhost:3000/bindly/usergroup/inGroup`, {
        headers: { 'Content-Type': 'application/json' },
        method: 'PUT',
        body: JSON.stringify({
          username: user?.username || '',
          groupId: groupData.groupid
        }),
      });

      if (!response.ok) {
        const errorResponse = await response.json();
        throw new Error(errorResponse.error || 'Failed to fetch group data');
      }

      const res = await response.json();
      return res.inGroup;
    } catch (error) {
      console.error(error);
    }
    return false;
  };


  const onRefresh = useCallback((): void => {
    setRefreshing(true);
    getGroup().then(() => setRefreshing(false));
  }, []);


  // Initial group fetch effect
  useEffect(() => {
    getGroup();
  }, []);

  // Navigation functions
  const back = (): void => {
    navigation.navigate('GroupsList');
  };

  const setting = (): void => {
    if (!loading) {
      navigation.navigate('GroupSetting');
    }
  };

  const toMembers = (): void => {
    navigation.navigate('MembersList');
  };


  const toPost = (): void => {
    if (createStatus === 'edit') {
      navigation.navigate('EditPost');
    } else if (createStatus === 'post') {
      navigation.navigate('CreatePost');
    } else {
      Alert.alert('Wait 4 hours from previous post');
    }
  };

  const toInfo = (): void => {
    navigation.navigate('Info');
  };

  const loadMorePosts = (): void => {
    const nextPage = page + 1;
    const newVisiblePosts = posts.slice(0, nextPage * postsPerPage);
    setVisiblePosts(newVisiblePosts);
    setPage(nextPage);
  };

  const onOpenCommentsModal = (postid: string): void => {
    const post = posts.find(p => p.postid === postid);
    if (post) {
      setSelectedPostComments(post.comment || []);
      setSelectedPostId(postid);
      setCommentsModalVisible(true);
      bottomSheetRef.current?.expand();
    }
  };

  const onOpenLikesModal = (postid: string): void => {
    const post = posts.find(p => p.postid === postid);
    if (post) {
      setSelectedPostLikes(post.likes || []);
      setSelectedPostId(postid);
      setLikesModalVisible(true);
      bottomSheetRef2.current?.expand();
    }
  };

  const closeCommentsModal = (): void => {
    setCommentsModalVisible(false);
    setSelectedPostComments([]);
    setSelectedPostId(null);
    setCommentText('');
    if (Keyboard.isVisible()) {
      Keyboard.dismiss();
    }
  };

  const closeLikesModal = (): void => {
    setLikesModalVisible(false);
    setSelectedPostLikes([]);
    setSelectedPostId(null);
  };


  return (
    <View style={styles.container}>
      <ScrollView
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onMomentumScrollEnd={(e) => {
          const { layoutMeasurement, contentOffset, contentSize } = e.nativeEvent;
          if (layoutMeasurement.height + contentOffset.y >= contentSize.height - 20) {
            loadMorePosts();
          }
        }}
        style={{ padding: 24 }}
      >
        <Pressable style={styles.backArrow} onPress={back}>
          <Image style={{ height: 40, width: 40 }} source={backArrow} />
        </Pressable>
        {!loading && (
          <Pressable style={styles.setting} onPress={setting}>
            <Image style={{ height: 40, width: 40 }} source={settings} />
          </Pressable>
        )}


        <GroupHeader
          loading={loading}
          imageUrl={imageUrl}
          groupName={groupData.groupname}
          started={started}
          ended={ended}
          startDate={groupData.startdate}
          endDate={groupData.enddate}
          createStatus={createStatus}
          back={back}
          setting={setting}
          toMembers={toMembers}
          toInfo={toInfo}
          toPost={toPost}
          styles={styles}
        />
        {loading && <ActivityIndicator size="large" color="#0000ff" />}

        <View style={{ marginBottom: 60 }}>
          {!loading && visiblePosts.map((post, index) => (
            <PostItem
              key={post.postid}
              postid={post.postid}
              imageLink={post?.photolink || ''}
              videoLink={post.videolink || ''}
              username={post.username}
              caption={post.caption || ''}
              pfpLink={getUserPfp(post.username)}
              time={post.timepost}
              valid={post.valid || false}
              veto={post.veto}
              totalUsers={totalUsers}
              removePost={removePost}
              updatePostVeto={updatePostVeto}
              updatePostLikes={updatePostLikes}
              groupId={groupId}
              userHasVeto={post.veto.includes(user?.username || '')}
              userHasLiked={post.likes.includes(user?.username || '')}
              comments={commentsHash[post.postid]}
              onOpenCommentsModal={onOpenCommentsModal} // Pass the function
              onOpenLikesModal={onOpenLikesModal}
              likes={post.likes}

            />
          ))}
        </View>
      </ScrollView>

      {/* Comments Modal */}
      <CommentsModal
        bottomSheetRef={bottomSheetRef}
        selectedPostComments={selectedPostComments}
        setSelectedPostComments={setSelectedPostComments}  // Add this
        commentText={commentText}
        setCommentText={setCommentText}
        closeCommentsModal={closeCommentsModal}
        styles={styles}
        selectedPostId={selectedPostId}
        groupId={groupId}
        username={user?.username || ''}
        addComment={addComment}
        userPfp={user?.pfp || ''}  // Add this
      />
      <LikesModal
        bottomSheetRef={bottomSheetRef2}
        selectedPostLikes={selectedPostLikes}
        getUserPfp={getUserPfp}
        closeLikesModal={closeLikesModal}
        styles={styles}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    backgroundColor: 'white',
    flex: 1,
  },
  backArrow: {
    position: 'absolute',
    top: 20,
    left: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  setting: {
    position: 'absolute',
    top: 20,
    right: 10,
    width: 50,
    height: 50,
    zIndex: 10,
  },
  logoContainer: {
    marginTop: 60,
    marginBottom: 36,
    marginLeft: 20,
    borderBottomColor: '#e3e3e3',
    borderBottomWidth: 1,
    paddingBottom: 10,
    height: 235,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    alignSelf: 'center',
    marginBottom: 20,
  },
  centeredRow: {
    alignItems: 'center',
    marginTop: 16,
  },
  headerButton: {
    width: 60,
    height: 60,
    padding: 10,
    backgroundColor: '#e3e3e3',
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: 5,
  },
  headerButtonIcon: {
    width: 30,
    height: 30,
  },
  createPost: {
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#FF8D1D',
    width: 180,
    height: 40,
    padding: 10,
    borderRadius: 8,
    alignSelf: 'center',
    marginTop: 20,
  },
  // Comments Modal Styles
  commentsModalContainer: {
    height: '100%', // 2/3 of the screen
    backgroundColor: 'white',
    borderTopLeftRadius: 10,
    borderTopRightRadius: 10,
    paddingTop: 10,
  },
  handle: {
    width: 40,
    height: 5,
    backgroundColor: '#ccc',
    borderRadius: 2.5,
    alignSelf: 'center',
    marginBottom: 10,
  },
  commentsHeader: {
    alignItems: 'center',
    paddingBottom: 10,
  },
  commentsTitle: {
    fontSize: 18,
    fontWeight: 'bold',
  },
  commentsContent: {
    flex: 1, // Makes ScrollView take up remaining space
    paddingHorizontal: 10,

  },
  commentItem: {
    marginVertical: 8,
  },
  likeItem: {
    marginVertical: 8,
    paddingHorizontal: 16
  },
  commentRow: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  commentProfileImage: {
    width: 30,
    height: 30,
    borderRadius: 4,
  },
  likeProfileImage: {
    width: 35,
    height: 35,
    borderRadius: 4,
  },
  commentTextContainer: {
    marginLeft: 8,
    flex: 1,
  },
  commentUsername: {
    fontWeight: 'bold',
    fontSize: 14,
  },
  likeUsername: {
    fontWeight: 700,
    fontSize: 16,
    marginVertical: 'auto',
    marginLeft: 12
  },
  commentText: {
    fontSize: 14,
    color: '#333',
    flexShrink: 1,
  },
  commentInputKeyboardAvoiding: {
    // Optional: additional styling if needed
  },
  commentInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    paddingTop: 10,
    paddingBottom: Platform.OS === 'ios' ? 0 : 10, // Adjust for iOS bottom padding
    borderTopColor: '#ccc',
    borderTopWidth: 1,
    paddingHorizontal: 5,

  },
  commentInput: {
    flex: 1,
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    fontSize: 14,
    maxHeight: 120,
  },
  sendButton: {
    marginLeft: 10,
    backgroundColor: 'dodgerblue',
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  sendButtonText: {
    color: 'white',
    fontSize: 16,
  },
  // No Comments Text
  noCommentsText: {
    textAlign: 'center',
    color: '#757575',
    marginTop: 20,
    fontSize: 16,
  },
});

export default GroupScreen;
